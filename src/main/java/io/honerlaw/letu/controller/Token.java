package io.honerlaw.facy.controller;

import org.mindrot.jbcrypt.BCrypt;

import io.honerlaw.facy.Controller;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.ext.auth.jwt.JWTOptions;
import io.vertx.ext.jdbc.JDBCClient;
import io.vertx.ext.sql.ResultSet;
import io.vertx.ext.sql.SQLConnection;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;

public class Token extends Controller {

	public Token(JDBCClient client, JWTAuth jwtAuth) {
		super(client, jwtAuth);
	}

	@Override
	public void register(Router router) {
		router.post("/token/new").handler(this::generate);
	}
	
	private void generate(RoutingContext ctx) {
		JsonObject obj = ctx.getBodyAsJson();
		
		if(obj == null || !obj.containsKey("username") || !obj.containsKey("password")) {
			ctx.response().setStatusCode(400).setStatusMessage("Username and password are required.").end();
			return;
		}
		
		String username = obj.getString("username");
		String password = obj.getString("password");
		
		// make sure the username / password is valid format
		if(password.length() < 6 || username.length() == 0 || !username.matches("[a-zA-Z0-9]*")) {
			ctx.response().setStatusCode(400).setStatusMessage("Invalid username or password.").end();
			return;
		}
		
		// get the database connection
		getClient().getConnection(res -> {
			if(res.succeeded()) {
				
				// find the user
				SQLConnection con = res.result();
				con.queryWithParams("SELECT * FROM users WHERE UPPER(username) = UPPER(?)", new JsonArray().add(username), queryRes -> {
					if(queryRes.succeeded()) {
						
						// check to make sure the user gave a valid username / password and that the user exists
						ResultSet set = queryRes.result();
						if(set.getNumRows() == 1) {
							JsonObject user = set.getRows().get(0);
							if(BCrypt.checkpw(password, user.getString("hash"))) {
								String token = getJWTAuth().generateToken(new JsonObject().put("id", user.getLong("id")), new JWTOptions());
								ctx.response().setStatusCode(200).setStatusMessage("OK").putHeader("content-type", "application/json").end(new JsonObject().put("token", token).toString());
							} else {
								ctx.response().setStatusCode(400).setStatusMessage("Invalid username or password.").end();
							}
						} else {
							ctx.response().setStatusCode(400).setStatusMessage("Invalid username or password.").end();
						}
						
					} else {
						queryRes.cause().printStackTrace();
						ctx.response().setStatusCode(500).setStatusMessage("Invalid username or password.").end();
					}
					
					// return the connection to the connection pool
					con.close();
				});
			} else {
				res.cause().printStackTrace();
				ctx.response().setStatusCode(500).setStatusMessage("Invalid username or password.").end();
			}
		});
		
		
	}

}
