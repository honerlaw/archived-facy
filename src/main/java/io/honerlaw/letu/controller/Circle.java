package io.honerlaw.facy.controller;

import io.honerlaw.facy.Controller;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.ext.jdbc.JDBCClient;
import io.vertx.ext.sql.SQLConnection;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.JWTAuthHandler;

public class Circle extends Controller {

	public Circle(JDBCClient client, JWTAuth jwtAuth) {
		super(client, jwtAuth);
	}

	@Override
	public void register(Router router) {
		
		// register the routes that are protected
		router.route("/circle").handler(JWTAuthHandler.create(getJWTAuth()));
		router.route("/circle/*").handler(JWTAuthHandler.create(getJWTAuth()));
		
		// get a list of circles
		router.get("/circle").handler(this::get);
		
		// create a new circle
		router.post("/circle/create").handler(this::create);
		
		// delete a given circle
		router.delete("/circle/delete/:id").handler(this::delete);
	}
	
	/**
	 * Retrieve a list of circles that the current user owns
	 * 
	 * @param ctx The routing context
	 */
	private void get(RoutingContext ctx) {
		long uid = ctx.user().principal().getLong("id");
		
		// get database connection
		getClient().getConnection(res -> {
			if(res.succeeded()) {
				
				// find all circles
				SQLConnection con = res.result();
				con.queryWithParams("SELECT * FROM circles WHERE users_id = ?", new JsonArray().add(uid), queryRes -> {
					if(queryRes.succeeded()) {
						JsonObject resp = new JsonObject().put("circles", new JsonArray(queryRes.result().getRows()));
						ctx.response().setStatusCode(200).setStatusMessage("OK").end(resp.toString());
					} else {
						queryRes.cause().printStackTrace();
						ctx.response().setStatusCode(500).setStatusMessage("Failed to retrieve circles.").end();
					}
					con.close();
				});
				
			} else {
				res.cause().printStackTrace();
				ctx.response().setStatusCode(500).setStatusMessage("Failed to retrieve circles.").end();
			}
		});
	}
	
	/**
	 * Creates a new circle
	 * 
	 * @param ctx The routing context
	 */
	private void create(RoutingContext ctx) {
		JsonObject obj = ctx.getBodyAsJson();
		
		// make sure they passed a valid circle title
		if(!obj.containsKey("title") || obj.getString("title").length() == 0 || obj.getString("title").length() > 150 || !obj.getString("title").matches("[a-zA-Z0-9 _'\"]")) {
			ctx.response().setStatusCode(400).setStatusMessage("Invalid circle title.").end();
			return;
		}
		
		// get the user id who is creating the circle
		long uid = ctx.user().principal().getLong("id");
		
		// get the database connection
		getClient().getConnection(res -> {
			if(res.succeeded()) {
				
				// insert the circle to be created
				SQLConnection con = res.result();
				con.updateWithParams("INSERT INTO circles (users_id, title) VALUES (?, ?)", new JsonArray().add(uid).add(obj.getString("title")), insertRes -> {
					if(insertRes.succeeded()) {
						ctx.response().setStatusCode(200).setStatusMessage("OK").end();
					} else {
						res.cause().printStackTrace();
						ctx.response().setStatusCode(500).setStatusMessage("Failed to create circle.").end();
					}
					con.close();
				});
				
			} else {
				res.cause().printStackTrace();
				ctx.response().setStatusCode(500).setStatusMessage("Failed to create circle.").end();
			}
		});
	}
	
	/**
	 * Deletes a circle given the circles id
	 * 
	 * @param ctx The routing context
	 */
	private void delete(RoutingContext ctx) {
		// make sure a valid long was passed
		if(!ctx.request().getParam("id").matches("\\d+")) {
			ctx.response().setStatusCode(400).setStatusMessage("Invalid circle id.").end();
			return;
		}
		long circleId = Long.valueOf(ctx.request().getParam("id"));
		long uid = ctx.user().principal().getLong("id");
	
		// get the database connection
		getClient().getConnection(res -> {
			if(res.succeeded()) {
				
				// try and delete the circle
				SQLConnection con = res.result();
				con.updateWithParams("DELETE FROM circles WHERE id = ? AND users_id = ?", new JsonArray().add(circleId).add(uid), deleteRes -> {					
					if(deleteRes.succeeded()) {
						ctx.response().setStatusCode(200).setStatusMessage("OK").end();
					} else {
						ctx.response().setStatusCode(500).setStatusMessage("Failed to delete circle.").end();
					}
					con.close();
				});
				
			} else {
				res.cause().printStackTrace();
				ctx.response().setStatusCode(500).setStatusMessage("Failed to delete circle.").end();
			}
		});
	}

}
