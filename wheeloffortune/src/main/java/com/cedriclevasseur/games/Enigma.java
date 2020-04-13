package com.cedriclevasseur.games;

import java.util.Random;

/**
 *
 * @author cedric
 */
public class Enigma {
 
    private String clue;
    private String category;
    
    public Enigma(String clue, String category) {
        this.clue = clue;
        this.category = category;
    }
    
    public String getClue() {
        return clue;
    }

    public String getCategory() {
        return category;
    }
    
    private static Enigma read(Integer choosen){
        return new Enigma("Best and Beauty", "Disney");
    }

    private static int size() {
        return 100;
    }
    
    public static Enigma rand(){
        Random random = new Random();
        Integer choosen = random.nextInt(Enigma.size());
        return read(choosen);
    }
    
   
}
