/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package edu.eci.arsw.collabpaint;

import edu.eci.arsw.collabpaint.model.Point;
import java.util.ArrayList;
import java.util.HashMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

/**
 *
 * @author Jonathan Prieto
 */
@Controller
public class STOMPMessagesHandler {

    private HashMap<Integer, ArrayList<Point>> hashPoints = new HashMap<Integer, ArrayList<Point>>();
    private int room;

    @Autowired
    SimpMessagingTemplate msgt;

    /**
     * Se usa synchronized en el siguiente metodo, para evitar las condiciones.
     * @param pt
     * @param numdibujo
     * @throws Exception
     */
    @MessageMapping("/newpoint.{numdibujo}")
    public synchronized void handlePointEvent(Point pt, @DestinationVariable String numdibujo) throws Exception {
        
        room = Integer.parseInt(numdibujo);
        ArrayList<Point> points;
        
        if (hashPoints.containsKey(room)) {
            points = hashPoints.get(room);
            points.add(pt);
        } else {
            points = new ArrayList<>();
            points.add(pt);
            hashPoints.put(room, points);
        }
        
        System.out.println("Nuevo punto recibido en el servidor!:" + pt);
        
        msgt.convertAndSend("/topic/newpoint." + numdibujo, pt);

        if (hashPoints.get(room).size() == 3) {
            msgt.convertAndSend("/topic/newpolygon." + numdibujo, points);
        } else if(hashPoints.get(room).size() > 3){
            msgt.convertAndSend("/topic/newpolygon." + numdibujo, points);
            hashPoints.get(room).clear();
        }
    }
}
