package io.honerlaw.facy;

import io.honerlaw.facy.controller.Circle;
import io.honerlaw.facy.controller.Friend;
import io.honerlaw.facy.controller.FriendRequest;
import io.honerlaw.facy.controller.Search;
import io.honerlaw.facy.controller.Token;
import io.honerlaw.facy.controller.User;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.ext.jdbc.JDBCClient;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.BodyHandler;
import io.vertx.ext.web.handler.StaticHandler;

public class Server extends AbstractVerticle {
	
	@Override
	public void start() {
		
		// load the application configuration
		JsonObject config = getConfig();
		
		// create the database client
		JDBCClient client = JDBCClient.createNonShared(getVertx(), config.getJsonObject("database"));
		
		// create the jwt auth provider
		JWTAuth jwtAuth = JWTAuth.create(getVertx(), config.getJsonObject("jwt"));
		
		// create the router
		Router api = Router.router(getVertx());
		
		// add the body handler to all api routes to parse the body accordingly
		api.route().handler(BodyHandler.create());
		
		// register all of the routes with the router
		new User(client, jwtAuth).register(api);
		new Token(client, jwtAuth).register(api);
		new FriendRequest(client, jwtAuth).register(api);
		new Friend(client, jwtAuth).register(api);
		new Circle(client, jwtAuth).register(api);
		new Search(client, jwtAuth).register(api);
		
		// add the api sub router
		Router router = Router.router(getVertx()).mountSubRouter("/api", api);
		
		// add a static handler
		router.route().handler(StaticHandler.create().setFilesReadOnly(false).setCachingEnabled(false));
		
		// start the server and set the router
		getVertx().createHttpServer().requestHandler(router::accept).listen(8080);
	}
	
	private JsonObject getConfig() {
		Buffer buffer = getVertx().fileSystem().readFileBlocking("config.json");
		return new JsonObject(buffer.getString(0, buffer.length()));
	}
	
	public static void main(String[] args) {
		Vertx.vertx().deployVerticle(new Server());
	}

}
