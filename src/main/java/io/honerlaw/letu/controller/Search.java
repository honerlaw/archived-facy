package io.honerlaw.facy.controller;

import java.util.ArrayList;
import java.util.List;

import io.honerlaw.facy.Controller;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.ext.jdbc.JDBCClient;
import io.vertx.ext.sql.ResultSet;
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
				con.queryWithParams("SELECT users.id, users.username, users.created, friends.id as friend_id, friends.users_id as friend_user_id, friend_requests.id as friend_request_id, friend_requests.requestor_id as friend_requestor_id, friend_requests.requestee_id as friend_requestee_id FROM users LEFT JOIN friends ON friends.friends_id = users.id LEFT JOIN friend_requests ON friend_requests.requestor_id = users.id OR friend_requests.requestee_id = users.id WHERE username LIKE ? and users.id != ?", new JsonArray().add(query).add(uid), queryRes -> {
					if(queryRes.succeeded()) {
						ResultSet set = queryRes.result();
						
						// store the different types of accounts
						List<JsonObject> users = new ArrayList<JsonObject>();
						List<JsonObject> friends = new ArrayList<JsonObject>();
						List<JsonObject> invites = new ArrayList<JsonObject>();
						List<JsonObject> requests = new ArrayList<JsonObject>();
						
						// sort all of the results into the correct groups
						set.getRows().forEach(row -> {							
							if(row.getLong("friend_user_id") != null && row.getLong("friend_user_id") == uid) {
								friends.add(row);
							} else if(row.getLong("friend_requestor_id") != null && row.getLong("friend_requestor_id") == uid) {
								requests.add(row);
							} else if(row.getLong("friend_requestee_id") != null && row.getLong("friend_requestee_id") == uid) {
								invites.add(row);
							} else {
								users.add(row);
							}
						});
						
						// build and send the response
						JsonObject resp = new JsonObject()
								.put("friends", new JsonArray(friends))
								.put("requests", new JsonArray(requests))
								.put("invites", new JsonArray(invites))
								.put("users", new JsonArray(users));
						ctx.response().setStatusCode(200).setStatusMessage("OK").putHeader("content-type", "application/json").end(resp.toString());
					} else {
						queryRes.cause().printStackTrace();
					}
					con.close();
				});
			
			} else {
				ctx.response().setStatusCode(500).setStatusMessage("Searching failed.").end();
				res.cause().printStackTrace();
			}
		});
		
		
	}

}
