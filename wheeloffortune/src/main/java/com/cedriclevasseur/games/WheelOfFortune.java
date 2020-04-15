package com.cedriclevasseur.games;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.json.Json;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.BodyHandler;

/**
 *
 * @author cedric
 */
public class WheelOfFortune extends AbstractVerticle {
 
  

  @Override
  public void start() {
    // Create a Vert.x web router
    Router router = Router.router(vertx);

    // Register a simple first route on /
    router.get("/").handler(rc -> {
      rc.response().end("Welcome");
    });
    
    // Register a second router retrieving all stored names as JSON
    router.get("/enigma").handler(
        // Just encode the list as JSON and return.
        rc -> rc.response()
            .putHeader("content-type", "application/json")
            .end(Json.encode(Enigma.rand())));

    // Register a body handler indicating that other routes need
    // to read the request body
    router.route().handler(BodyHandler.create());

    vertx.createHttpServer()
        // Pass the router's accept method as request handler
        .requestHandler(router::accept)
        .listen(8080);
  }

}
