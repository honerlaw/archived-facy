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
										
										long id = insertRes.result().getKeys().getLong(0);
										
										// generate a token
										final String token = getJWTAuth().generateToken(new JsonObject().put("id", id), new JWTOptions());
										
										// get the user's information
										con.queryWithParams("SELECT id, username, profile_image, created FROM users WHERE id = ?", new JsonArray().add(id), selectRes -> {
											if(selectRes.succeeded()) {
												JsonObject data = selectRes.result().getRows().get(0).put("token", token);
												ctx.response().setStatusCode(200).setStatusMessage("OK").putHeader("content-type", "application/json").end(data.toString());
											} else {
												selectRes.cause().printStackTrace();
											}
											con.close();
										});
										
									} else {
										ctx.response().setStatusCode(500).setStatusMessage("Failed to create new user.").end();
										con.close();
									}
								} else {
									ctx.response().setStatusCode(500).setStatusMessage("Failed to create new user.").end();
									con.close();
								}
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
				con.queryWithParams("SELECT id, username, profile_image, created FROM users WHERE id = ?", new JsonArray().add(uid), queryRes -> {
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
		long uid = ctx.user().principal().getLong("id");
		Set<FileUpload> files = ctx.fileUploads();
		files.forEach(file -> {
			
			// make sure the content type is an image
			if(!file.contentType().startsWith("image")) {
				return;
			}
			
			// read the file data from the temporary upload file directory
			ctx.vertx().fileSystem().readFile(file.uploadedFileName(), res -> {
				if(res.succeeded()) {
					
					// move the temporary file into image webroot directory
					ctx.vertx().fileSystem().writeFile("resources/webroot/file/image/profile/" + Long.toString(uid), res.result(), writeRes -> {
						if(writeRes.succeeded()) {
							
							// delete the temporary file
							ctx.vertx().fileSystem().delete(file.uploadedFileName(), deleteRes -> {
								if(deleteRes.succeeded()) {
									
									// get the database connection
									getClient().getConnection(conRes -> {
										if(conRes.succeeded()) {
											SQLConnection con = conRes.result();
											
											// update the url in the database with the user image url path
											con.updateWithParams("UPDATE users SET profile_image = ? WHERE id = ?", new JsonArray().add("/file/image/profile/" + uid).add(uid), updateRes -> {
												if(updateRes.succeeded()) {
													
													// make sure we successfully updated the user
													if(updateRes.result().getUpdated() == 1) {
														
														// respond with the url location
														JsonObject resp = new JsonObject().put("url", "/file/image/profile/" + uid);
														ctx.response().setStatusCode(200).setStatusMessage("OK").putHeader("content-type", "application/json").end(resp.toString());
													} else {
														ctx.response().setStatusCode(500).setStatusMessage("Failed to upload file.").end();
													}
													
												} else {
													updateRes.cause().printStackTrace();
													ctx.response().setStatusCode(500).setStatusMessage("Failed to upload file.").end();
												}
												con.close();
											});
											
										} else {
											ctx.response().setStatusCode(500).setStatusMessage("Failed to upload file.").end();
										}
									});
									
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
