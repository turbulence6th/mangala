package com.turbulence6th.mangala;

import java.io.IOException;
import java.util.Map;
import java.util.Random;

import javax.servlet.ServletContext;
import javax.websocket.EndpointConfig;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

@ServerEndpoint(value = "/websocket", configurator = ServletAwareConfig.class)
public class WebSocket {

	private ServletContext context;
	
	private Session session;

	private Session opponent;
	
	private String room;

	@OnOpen
	public void handleOpen(Session session, EndpointConfig config) throws IOException {
		this.context = (ServletContext) config.getUserProperties().get("servletContext");
	}

	@SuppressWarnings("unchecked")
	@OnMessage
	public void handleMessage(Session session, String message) {
		Map<String, WebSocket> rooms = (Map<String, WebSocket>) this.context.getAttribute("rooms");
		JsonObject request = new JsonParser().parse(message).getAsJsonObject();
		String action = request.get("action").getAsString();
		if (action.equals("create")) {
			Random random = new Random();
			this.room = String.valueOf(random.nextInt(10)) + String.valueOf(random.nextInt(10))
					+ String.valueOf(random.nextInt(10)) + String.valueOf(random.nextInt(10));
			rooms.put(room, this);
			JsonObject response = new JsonObject();
			response.addProperty("action", "create");
			response.addProperty("status", true);
			response.addProperty("room", room);
			
			this.session = session;
			
			try {
				session.getBasicRemote().sendText(response.toString());
			} catch (IOException e) {
				e.printStackTrace();
			}
		}

		else if (action.equals("join")) {
			String room = request.get("room").getAsString();
			if(rooms.containsKey(room)) {
				WebSocket value = rooms.get(room);
				JsonObject response = new JsonObject();
				response.addProperty("action", "join");
				response.addProperty("status", true);

				try {
					response.addProperty("turn", 2);
					session.getBasicRemote().sendText(response.toString());
				} catch (IOException e) {
					e.printStackTrace();
				}

				this.opponent = value.getSession();
				value.setOpponent(session);

				try {
					response.addProperty("turn", 1);
					this.opponent.getBasicRemote().sendText(response.toString());
				} catch (IOException e) {
					e.printStackTrace();
				}
				
				rooms.remove(room);
			}
			
			else {
				JsonObject response = new JsonObject();
				response.addProperty("action", "join");
				response.addProperty("status", false);
				
				try {
					session.getBasicRemote().sendText(response.toString());
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
			
		}

		else if (action.equals("move")) {
			try {
				this.opponent.getBasicRemote().sendText(request.toString());
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		
		else if (action.equals("cancel")) {
			rooms.remove(this.room);
		}
	}

	@SuppressWarnings("unchecked")
	@OnClose
	public void handleClose(Session session) {
		Map<String, WebSocket> rooms = (Map<String, WebSocket>) this.context.getAttribute("rooms");
		rooms.remove(this.room);
		
		if(this.opponent != null && this.opponent.isOpen()) {
			JsonObject response = new JsonObject();
			response.addProperty("action", "leave");
			
			try {
				this.opponent.getBasicRemote().sendText(response.toString());
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	}

	@OnError
	public void handleError(Throwable t) {
		t.printStackTrace();
	}
	
	public Session getSession() {
		return session;
	}

	public void setOpponent(Session opponent) {
		this.opponent = opponent;
	}

}
