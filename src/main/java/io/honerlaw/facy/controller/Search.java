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

public class Search extends Controller {

	public Search(JDBCClient client, JWTAuth jwtAuth) {
		super(client, jwtAuth);
		// TODO Auto-generated constructor stub
	}

	@Override
	public void register(Router router) {
		
		// mark the routes that are protected
		router.route("/search").handler(JWTAuthHandler.create(getJWTAuth()));
		
		router.get("/search").handler(this::search);
		
	}
	
	private void search(RoutingContext ctx) {
		String temp = ctx.request().getParam("query");
		
		// make sure we have a valid json request
		if(temp == null || temp.trim().length() == 0) {
			ctx.response().setStatusCode(400).setStatusMessage("Invalid search request.").end();
			return;
		}
		
		// get the query
		String query = '%' + temp.trim() + '%';
		
		// get the user id
		long uid = ctx.user().principal().getLong("id");
		
		getClient().getConnection(res -> {
			if(res.succeeded()) {
				
				SQLConnection con = res.result();
				
				// get a list of the current user's friends
				con.queryWithParams("SELECT friends.id as friend_id, users.id, users.username, users.profile_image, users.created FROM users JOIN friends ON friends.friends_id = users.id AND friends.users_id = ? WHERE users.id != ? AND users.username LIKE ?", new JsonArray().add(uid).add(uid).add(query), friendRes -> {
					if(friendRes.succeeded()) {
						
						// get a list of the current pending requests
						con.queryWithParams("SELECT friend_requests.id as friend_request_id, users.id, users.username, users.profile_image, users.created FROM users JOIN friend_requests ON friend_requests.requestee_id = users.id AND friend_requests.requestor_id = ? WHERE users.id != ? AND users.username LIKE ?", new JsonArray().add(uid).add(uid).add(query), requestRes -> {
							if(requestRes.succeeded()) {
								
								// get a list of the current pending invites
								con.queryWithParams("SELECT friend_requests.id as friend_request_id, users.id, users.username, users.profile_image, users.created FROM users JOIN friend_requests ON friend_requests.requestor_id = users.id AND friend_requests.requestee_id = ? WHERE users.id != ? AND users.username LIKE ?", new JsonArray().add(uid).add(uid).add(query), inviteRes -> {
									if(inviteRes.succeeded()) {
										
										// get a list of users who we have no relationship to
										con.queryWithParams("SELECT users.id, users.username, users.profile_image, users.created FROM users LEFT JOIN friends ON friends.friends_id = users.id AND friends.users_id = ? LEFT JOIN friend_requests ON (friend_requests.requestee_id = users.id AND friend_requests.requestor_id = ?) OR (friend_requests.requestor_id = users.id AND friend_requests.requestee_id = ?) WHERE users.id != ? AND users.username LIKE ? AND friends.friends_id IS NULL AND friend_requests.requestor_id IS NULL AND friend_requests.requestee_id IS NULL", new JsonArray().add(uid).add(uid).add(uid).add(uid).add(query), userRes -> {
											if(userRes.succeeded()) {
																						
												// build and send the response
												JsonObject resp = new JsonObject()
														.put("friends", new JsonArray(friendRes.result().getRows()))
														.put("requests", new JsonArray(requestRes.result().getRows()))
														.put("invites", new JsonArray(inviteRes.result().getRows()))
														.put("users", new JsonArray(userRes.result().getRows()));
												ctx.response().setStatusCode(200).setStatusMessage("OK").putHeader("content-type", "application/json").end(resp.toString());
												
											} else {
												ctx.response().setStatusCode(500).setStatusMessage("Searching failed.").end();
												userRes.cause().printStackTrace();
											}
											con.close();
										});
										
									} else {
										ctx.response().setStatusCode(500).setStatusMessage("Searching failed.").end();
										inviteRes.cause().printStackTrace();
										con.close();
									}
								});
								
							} else {
								ctx.response().setStatusCode(500).setStatusMessage("Searching failed.").end();
								requestRes.cause().printStackTrace();
								con.close();
							}
						});
						
					} else {
						ctx.response().setStatusCode(500).setStatusMessage("Searching failed.").end();
						friendRes.cause().printStackTrace();
						con.close();
					}
				});
			
			} else {
				ctx.response().setStatusCode(500).setStatusMessage("Searching failed.").end();
				res.cause().printStackTrace();
			}
		});
		
		
	}

}
