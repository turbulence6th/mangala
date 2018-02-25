package com.turbulence6th.mangala;

import java.util.HashMap;

import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;


@WebListener
public class ApplicationListener implements ServletContextListener {
	
	public void contextInitialized(ServletContextEvent event)  { 
        ServletContext context = event.getServletContext();
        context.setAttribute("rooms", new HashMap<>());
    }

    public void contextDestroyed(ServletContextEvent event)  { 
         
    }
	
}
