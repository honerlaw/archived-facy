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

public class Friend extends Controller {

	public Friend(JDBCClient client, JWTAuth jwtAuth) {
		super(client, jwtAuth);
	}

	@Override
	public void register(Router router) {
		
		// mark routes that are protected
		router.route("/friend").handler(JWTAuthHandler.create(getJWTAuth()));
		router.route("/friend/delete/*").handler(JWTAuthHandler.create(getJWTAuth()));
		
		// gets a list of friends
		router.get("/friend").handler(this::get);
		
		// deletes a friend given their user id
		router.delete("/friend/delete/:uid").handler(this::delete);
	}
	
	/**
	 * Retrieves a list of friends for the given user
	 * 
	 * @param ctx The routing context
	 */
	private void get(RoutingContext ctx) {
		// get the current user's id
		long uid = Long.valueOf(ctx.user().principal().getLong("id"));
		
		// get database connection
		getClient().getConnection(res -> {
			if(res.succeeded()) {
				
				// select all of the user's friends
				SQLConnection con = res.result();
				con.queryWithParams("SELECT friends.id as friend_id, users.id as id, users.username, users.profile_image, users.created FROM friends JOIN users ON users.id = friends.friends_id WHERE users_id = ?", new JsonArray().add(uid), queryRes -> {
					if(queryRes.succeeded()) {
						
						// get the list of friends
						JsonObject resp = new JsonObject().put("friends", new JsonArray(queryRes.result().getRows()));
						
						// send out the response
						ctx.response().setStatusCode(200).setStatusMessage("OK").putHeader("content-type", "application/json").end(resp.toString());
						
					} else {
						queryRes.cause().printStackTrace();
						ctx.response().setStatusCode(500).setStatusMessage("Failed to retrieve friends.").end();
					}
					con.close();
				});
				
			} else {
				res.cause().printStackTrace();
				ctx.response().setStatusCode(500).setStatusMessage("Failed to retrieve friends.").end();
			}
		});
	}
	
	/**
	 * Removes a user from the current user's friend list
	 *
	 * @param ctx The routing context
	 */
	private void delete(RoutingContext ctx) {
		// make sure a valid long was passed
		if(!ctx.request().getParam("uid").matches("\\d+")) {
			ctx.response().setStatusCode(400).setStatusMessage("Invalid user id.").end();
			return;
		}
		long uid = ctx.user().principal().getLong("id");
		long fid = Long.valueOf(ctx.request().getParam("uid"));

		// get database connection
		getClient().getConnection(res -> {
			if(res.succeeded()) {
				
				// delete the friend relationship
				SQLConnection con = res.result();
				con.updateWithParams("DELETE FROM friends WHERE (users_id = ? AND friends_id = ?) OR (users_id = ? AND friends_id = ?)", new JsonArray().add(uid).add(fid).add(fid).add(uid), deleteRes -> {
					if(deleteRes.succeeded()) {
						if(deleteRes.result().getUpdated() > 0) {
							ctx.response().setStatusCode(200).setStatusMessage("OK").end();
						} else {
							ctx.response().setStatusCode(400).setStatusMessage("Failed to delete friend.").end();
						}
					} else {
						deleteRes.cause().printStackTrace();
						ctx.response().setStatusCode(500).setStatusMessage("Failed to delete friend.").end();
					}
					con.close();
				});
				
			} else {
				res.cause().printStackTrace();
				ctx.response().setStatusCode(500).setStatusMessage("Failed to delete friend.").end();
			}
		});
	}

}
