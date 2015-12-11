package io.honerlaw.facy.controller;

import java.util.Set;

import org.mindrot.jbcrypt.BCrypt;

import io.honerlaw.facy.Controller;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.ext.auth.jwt.JWTOptions;
import io.vertx.ext.jdbc.JDBCClient;
import io.vertx.ext.sql.ResultSet;
import io.vertx.ext.sql.SQLConnection;
import io.vertx.ext.web.FileUpload;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.JWTAuthHandler;

public class User extends Controller {
	
	public User(JDBCClient client, JWTAuth jwtAuth) {
		super(client, jwtAuth);
	}
	
	@Override
	public void register(Router router) {
		// mark the routes that are protected
		router.route("/user/profile").handler(JWTAuthHandler.create(getJWTAuth()));
		router.route("/user/profile/upload").handler(JWTAuthHandler.create(getJWTAuth()));
		
		// creates a new user
		router.post("/user/create").handler(this::create);
		
		// view the current user's profile
		router.get("/user/profile").handler(this::profile);
		
		router.post("/user/profile/upload").handler(this::upload);
	}
	
	private void create(RoutingContext ctx) {
		JsonObject obj = ctx.getBodyAsJson();
	
		// make sure we have the minimum required payload
		if(!obj.containsKey("username") || !obj.containsKey("password") || !obj.containsKey("verifyPassword")) {
			ctx.response().setStatusCode(400).setStatusMessage("Username, password, and verification password are required.").end();
			return;
		}
		
		String username = obj.getString("username");
		String password = obj.getString("password");
		String vpassword = obj.getString("verifyPassword");
		
		if(username.length() == 0 || !username.matches("[a-zA-Z0-9]*")) {
			ctx.response().setStatusCode(400).setStatusMessage("Username can only contain alphanumeric characters.").end();
			return;
		}
		
		if(password.length() < 6) {
			ctx.response().setStatusCode(400).setStatusMessage("Password must be at least 6 characters long.").end();
			return;
		}
		
		if(!password.equals(vpassword)) {
			ctx.response().setStatusCode(400).setStatusMessage("Passwords do not match.").end();
			return;
		}
		
		// hash the password
		String hash = BCrypt.hashpw(password, BCrypt.gensalt(12));
		
		// get the database connection
		getClient().getConnection(res -> {
			if(res.succeeded()) {
				
				// get the database connection
				SQLConnection con = res.result();
				
				// check to see if the user exists
				con.queryWithParams("SELECT * FROM users WHERE UPPER(username) = UPPER(?)", new JsonArray().add(username), queryRes -> {
					if(queryRes.succeeded()) {
						if(queryRes.result().getNumRows() == 0) {
							
							// if the user does not exist add them
							con.updateWithParams("INSERT INTO users (username, hash) VALUES (?, ?)", new JsonArray().add(username).add(hash), insertRes -> {
								if(insertRes.succeeded()) {
									
									// successfully inserted the one user
									if(insertRes.result().getUpdated() == 1) {
										
										// generate a token
										String token = getJWTAuth().generateToken(new JsonObject().put("id", insertRes.result().getKeys().getInteger(0)), new JWTOptions());
										
										// send out the token to the user
										ctx.response().setStatusCode(200).setStatusMessage("OK").putHeader("content-type", "application/json").end(new JsonObject().put("token", token).toString());
									} else {
										ctx.response().setStatusCode(500).setStatusMessage("Failed to create new user.").end();
									}
								} else {
									ctx.response().setStatusCode(500).setStatusMessage("Failed to create new user.").end();
								}
								con.close();
							});
						} else {
							ctx.response().setStatusCode(409).setStatusMessage("Username already in use.").end();
							con.close();
						}
					} else {
						res.cause().printStackTrace();
						ctx.response().setStatusCode(500).setStatusMessage("Failed to create new user.").end();
						con.close();
					}
				});
			} else {
				res.cause().printStackTrace();
				ctx.response().setStatusCode(500).setStatusMessage("Failed to create new user.").end();
			}
		});
	}
	
	/**
	 * Get the current user's information
	 * 
	 * @param ctx
	 */
	private void profile(RoutingContext ctx) {
		
		long uid = ctx.user().principal().getLong("id");
		
		getClient().getConnection(res -> {
			if(res.succeeded()) {
				
				SQLConnection con = res.result();
				con.queryWithParams("SELECT id, username, created FROM users WHERE id = ?", new JsonArray().add(uid), queryRes -> {
					if(queryRes.succeeded()) {
						ResultSet set = queryRes.result();
						if(set.getNumRows() == 1) {
							JsonObject data = set.getRows().get(0);
							ctx.response().setStatusCode(200).setStatusMessage("OK").putHeader("content-type", "application/json").end(data.toString());							
						} else {
							ctx.response().setStatusCode(500).setStatusMessage("Failed to get user information.").end();
						}
					} else {
						ctx.response().setStatusCode(500).setStatusMessage("Failed to get user information.").end();
					}
					con.close();
				});
				
			} else {
				ctx.response().setStatusCode(500).setStatusMessage("Failed to get user information.").end();
			}
		});
		
	}
	
	private void upload(RoutingContext ctx) {
		
		// okay so what we are going to do here is a little weird but simple
		
		/*
		 * We have a directory called uploads. inside of that directory we have two directories (for now)
		 * -temp = holds all of the files that are initially uploaded
		 * -profile = holds the profile images after they have been processed and removed from the temp directory
		 */
		long uid = ctx.user().principal().getLong("id");
		Set<FileUpload> files = ctx.fileUploads();
		files.forEach(file -> {			
			ctx.vertx().fileSystem().readFile(file.uploadedFileName(), res -> {
				if(res.succeeded()) {
					
					ctx.vertx().fileSystem().writeFile("webroot/file/image/profile/" + Long.toString(uid), res.result(), writeRes -> {
						if(writeRes.succeeded()) {
							
							ctx.vertx().fileSystem().delete(file.uploadedFileName(), deleteRes -> {
								if(deleteRes.succeeded()) {
									
									JsonObject resp = new JsonObject().put("url", "file/image/profile/" + uid);
									ctx.response().setStatusCode(200).setStatusMessage("OK").putHeader("content-type", "application/json").end(resp.toString());
									
								} else {
									deleteRes.cause().printStackTrace();
									ctx.response().setStatusCode(500).setStatusMessage("Failed to upload file.").end();
								}
							});
						} else {
							writeRes.cause().printStackTrace();
							ctx.response().setStatusCode(500).setStatusMessage("Failed to upload file.").end();
						}
					});
					
				} else {
					res.cause().printStackTrace();
					ctx.response().setStatusCode(500).setStatusMessage("Failed to upload file.").end();
				}
			});

		});
	}

}
