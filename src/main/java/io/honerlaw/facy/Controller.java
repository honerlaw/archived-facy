package io.honerlaw.facy;

import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.ext.jdbc.JDBCClient;
import io.vertx.ext.web.Router;

public abstract class Controller {
	
	private final JDBCClient client;
	
	private final JWTAuth jwtAuth;
	
	public Controller(JDBCClient client, JWTAuth jwtAuth) {
		this.client = client;
		this.jwtAuth = jwtAuth;
	}
	
	public abstract void register(Router router);
	
	public JDBCClient getClient() {
		return client;
	}
	
	public JWTAuth getJWTAuth() {
		return jwtAuth;
	}

}
