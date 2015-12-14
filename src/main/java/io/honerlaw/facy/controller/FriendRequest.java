package io.honerlaw.facy.controller;

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

public class FriendRequest extends Controller {

	public FriendRequest(JDBCClient client, JWTAuth jwtAuth) {
		super(client, jwtAuth);
	}

	/**
	 * Register the routes for this controller with the router
	 * 
	 * @param router The router to register the routes with
	 */
	@Override
	public void register(Router router) {
		
		// mark routes that are protected
		router.route("/friend/request").handler(JWTAuthHandler.create(getJWTAuth()));
		router.route("/friend/request/*").handler(JWTAuthHandler.create(getJWTAuth()));
		
		// get a list of friend requests we sent and have received
		router.get("/friend/request").handler(this::get);
		
		// send out a friend request to user with uid (we are the requestor, they are the requestee)
		router.post("/friend/request/send/:uid").handler(this::create);
		
		// revoke a sent friend request given its id (we are the requestor, they are requestee)
		router.delete("/friend/request/revoke/:id").handler(this::delete);
		
		// accept a friend request given its id (we are the requestee, they are the requestor)
		router.post("/friend/request/accept/:id").handler(this::accept);
		
		// deny a friend request given its id (we are the requestee, they are the requestor)
		router.delete("/friend/request/deny/:id").handler(this::delete);
	}
	
	/**
	 * Get a list of all friend requests we have sent and received
	 * 
	 * @param ctx The routing context
	 */
	private void get(RoutingContext ctx) {
		long uid = ctx.user().principal().getLong("id");
		
		// get database connection
		getClient().getConnection(res -> {
			if(res.succeeded()) {
				
				// get connection
				SQLConnection con = res.result();
				
				// get list of sent friend requests
				con.queryWithParams("SELECT friend_requests.id as friend_request_id, users.id, users.username, users.profile_image, users.created FROM friend_requests JOIN users ON users.id = friend_requests.requestee_id WHERE requestor_id = ?", new JsonArray().add(uid), requestRes -> {
					if(requestRes.succeeded()) {
						
						// get list of received friend requests
						con.queryWithParams("SELECT friend_requests.id as friend_request_id, users.id, users.username, users.profile_image, users.created FROM friend_requests JOIN users ON users.id = friend_requests.requestor_id WHERE requestee_id = ?", new JsonArray().add(uid), inviteRes -> {
							if(inviteRes.succeeded()) {

								// send out repsonse
								JsonArray requests = new JsonArray(requestRes.result().getRows());
								JsonArray invites = new JsonArray(inviteRes.result().getRows());
								ctx.response().setStatusCode(200).setStatusMessage("OK").putHeader("content-type", "application/json").end(new JsonObject().put("requests", requests).put("invites", invites).toString());
								
							} else {
								inviteRes.cause().printStackTrace();
								ctx.response().setStatusCode(500).setStatusMessage("Failed to find friend requests.").end();
							}
							con.close();
						});
						
					} else {
						requestRes.cause().printStackTrace();
						ctx.response().setStatusCode(500).setStatusMessage("Failed to find friend requests.").end();
						con.close();
					}
				});
				
			} else {
				res.cause().printStackTrace();
				ctx.response().setStatusCode(500).setStatusMessage("Failed to find friend requests.").end();
			}
		});
		
	}
	
	/**
	 * Create a new friend request (send a friend request to another user)
	 * 
	 * @param ctx The routing context
	 */
	private void create(RoutingContext ctx) {
		
		// make sure the passed value is a valid long
		if(!ctx.request().getParam("uid").matches("\\d+")) {
			ctx.response().setStatusCode(400).setStatusMessage("Invalid user id.").end();
			return;
		}
		long uid = ctx.user().principal().getLong("id");
		long fid = Long.valueOf(ctx.request().getParam("uid"));
		
		if(uid == fid) {
			ctx.response().setStatusCode(400).setStatusMessage("You cannot send a friend request to yourself.").end();
			return;
		}
	
		// get the database connection
		getClient().getConnection(res -> {
			if(res.succeeded()) {
				
				SQLConnection con = res.result();
				
				// make sure we are not already friends
				con.queryWithParams("SELECT * FROM friends WHERE users_id = ? and friends_id = ?", new JsonArray().add(uid).add(fid), friendRes -> {
					if(friendRes.succeeded()) {
						
						// make sure we do not have a pending friend request or invite
						con.queryWithParams("SELECT * FROM friend_requests WHERE (requestor_id = ? AND requestee_id = ?) OR (requestor_id = ? AND requestee_id = ?)", new JsonArray().add(uid).add(fid).add(fid).add(uid), requestRes -> {
							if(requestRes.succeeded()) {
								ResultSet set = requestRes.result();
								if(set.getNumRows() == 0) {
									
									// add the friend request
									con.updateWithParams("INSERT INTO friend_requests (requestor_id, requestee_id) VALUES (?, ?)", new JsonArray().add(uid).add(fid), insertRes -> {
										if(insertRes.succeeded()) {
											if(insertRes.result().getUpdated() == 1) {
												ctx.response().setStatusCode(201).setStatusMessage("Created").end();
											} else {
												ctx.response().setStatusCode(400).setStatusMessage("Failed to send friend request.").end();
											}
										} else {
											insertRes.cause().printStackTrace();
											ctx.response().setStatusCode(500).setStatusMessage("Failed to send friend request.").end();
										}
										con.close();
									});
									
								} else {
									ctx.response().setStatusCode(400).setStatusMessage("A pending friend request already exists.").end();
									con.close();
								}
							} else {
								requestRes.cause().printStackTrace();
								ctx.response().setStatusCode(500).setStatusMessage("Failed to send friend request.").end();
								con.close();
							}
						});
						
					} else {
						friendRes.cause().printStackTrace();
						ctx.response().setStatusCode(500).setStatusMessage("Failed to send friend request.").end();
						con.close();
					}
				});
				
			} else {
				res.cause().printStackTrace();
				ctx.response().setStatusCode(500).setStatusMessage("Failed to send friend request.").end();
			}
		});
	}
	
	/**
	 * Accept a friend request given a friend request id
	 * 
	 * Checks to make sure that we are the requestee before accepting
	 * 
	 * @param ctx
	 */
	private void accept(RoutingContext ctx) {
		
		// make sure we have a valid friend request id
		if(!ctx.request().getParam("id").matches("\\d+")) {
			ctx.response().setStatusCode(400).setStatusMessage("Invalid user id.").end();
			return;
		}
		long uid = ctx.user().principal().getLong("id");
		long requestId = Long.valueOf(ctx.request().getParam("id"));
		
		// get the database connection
		getClient().getConnection(res -> {
			if(res.succeeded()) {
				
				SQLConnection con = res.result();
				
				// find the friend request
				con.queryWithParams("SELECT * FROM friend_requests WHERE id = ? and requestee_id = ?", new JsonArray().add(requestId).add(uid), queryRes -> {
					if(queryRes.succeeded()) {
						
						ResultSet set = queryRes.result();
						if(set.getNumRows() == 1) {
							long fid = set.getRows().get(0).getLong("requestor_id");
							
							// start a new database transaction
							con.setAutoCommit(false, autoCommitRes -> {
								if(autoCommitRes.succeeded()) {
									
									// delete the friend request
									con.updateWithParams("DELETE FROM friend_requests WHERE id = ? and requestee_id = ?", new JsonArray().add(requestId).add(uid), deleteRes -> {
										if(deleteRes.succeeded()) {
											
											// insert both friend relationships
											con.updateWithParams("INSERT INTO friends (users_id, friends_id) SELECT ?, ? UNION ALL SELECT ?, ?", new JsonArray().add(fid).add(uid).add(uid).add(fid), insertRes -> {
												if(insertRes.succeeded()) {
													
													// make sure we only deleted one row and added 2 rows
													if(deleteRes.result().getUpdated() == 1 && insertRes.result().getUpdated() == 2) {
														
														// commit the changes on success
														con.commit(commitRes -> {
															ctx.response().setStatusCode(201).setStatusMessage("Created").end();
														});
														
													} else {
														con.rollback(rollbackRes -> {
															ctx.response().setStatusCode(500).setStatusMessage("Failed to accept friend request.").end();
															con.close(); // return to connection pool
														});
													}
													
												} else {
													insertRes.cause().printStackTrace();
													con.rollback(rollbackRes -> {
														ctx.response().setStatusCode(500).setStatusMessage("Failed to accept friend request.").end();
														con.close(); // return to connection pool
													});
												}
											});
											
										} else {
											deleteRes.cause().printStackTrace();
											con.rollback(rollbackRes -> {
												ctx.response().setStatusCode(500).setStatusMessage("Failed to accept friend request.").end();
												con.close(); // return to connection pool
											});
										}
									});
									
								
								} else {
									autoCommitRes.cause().printStackTrace();
									ctx.response().setStatusCode(400).setStatusMessage("Could not find friend request.").end();
									con.close(); // return to connection pool
								}
							});
							
						} else {
							ctx.response().setStatusCode(400).setStatusMessage("Could not find friend request.").end();
							con.close(); // return to connection pool
						}
					} else {
						res.cause().printStackTrace();
						ctx.response().setStatusCode(500).setStatusMessage("Failed to accept friend request.").end();
						con.close(); // return to connection pool
					}
				});
				
			} else {
				res.cause().printStackTrace();
				ctx.response().setStatusCode(500).setStatusMessage("Failed to accept friend request.").end();
			}
		});
	}
	
	/**
	 * Delete a friend request given the friend request id
	 * 
	 * Checks to make sure that we are the requestor or requestee before
	 * deleting the friend request
	 * 
	 * @param ctx
	 */
	private void delete(RoutingContext ctx) {
		
		// make sure we have a valid friend request id
		if(!ctx.request().getParam("id").matches("\\d+")) {
			ctx.response().setStatusCode(400).setStatusMessage("Invalid user id.").end();
			return;
		}
		long uid = ctx.user().principal().getLong("id");
		long requestId = Long.valueOf(ctx.request().getParam("id"));
		
		// get database connection
		getClient().getConnection(res -> {
			if(res.succeeded()) {
				
				// delete the friend request as long as we are the requestor or requestee
				SQLConnection con = res.result();
				con.updateWithParams("DELETE FROM friend_requests where id = ? AND (requestor_id = ? or requestee_id = ?)", new JsonArray().add(requestId).add(uid).add(uid), deleteRes -> {
					if(deleteRes.succeeded()) {
						if(deleteRes.result().getUpdated() > 0) {
							ctx.response().setStatusCode(200).setStatusMessage("OK").end();
						} else {
							ctx.response().setStatusCode(400).setStatusMessage("Failed to delete friend request.").end();
						}
					} else {
						deleteRes.cause().printStackTrace();
						ctx.response().setStatusCode(500).setStatusMessage("Failed to delete friend request.").end();
					}
					con.close(); // return to connection pool
				});
				
			} else {
				res.cause().printStackTrace();
				ctx.response().setStatusCode(500).setStatusMessage("Failed to delete friend request.").end();
			}
		});
		
	}

}
