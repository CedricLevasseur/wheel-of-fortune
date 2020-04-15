package com.cedriclevasseur.games;

import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.LineNumberReader;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Random;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 *
 * @author cedric
 */
public class Enigma {
 
    private static final String BANK_PATH = "src/main/resources/Bank.txt";
    
    private final String clue;
    private final String category;
    
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
    
    private static Enigma read(Integer lineNumber) {
        try {
            String str = Files.lines(Paths.get(BANK_PATH)).skip(lineNumber - 1).findFirst().get();
            System.out.println("Content at " + lineNumber + " Number:- " + str);
            String[] parts = str.split(";");
            Enigma enigma = new Enigma(parts[1], parts[0]);
            return enigma;
        } catch (IOException ex) {
            Logger.getLogger(Enigma.class.getName()).log(Level.SEVERE, null, ex);
        }
        return null;
    }

    private static int size() {
        try
            (
               FileReader       input = new FileReader(BANK_PATH);
               LineNumberReader count = new LineNumberReader(input);
            )
            {
               while (count.skip(Long.MAX_VALUE) > 0)
               {
                  // Loop just in case the file is > Long.MAX_VALUE or skip() decides to not read the entire file
               }

               return count.getLineNumber() + 1;                                    // +1 because line index starts at 0
            } catch (IOException ex) {
            Logger.getLogger(Enigma.class.getName()).log(Level.SEVERE, null, ex);
        }
        return 0;
    }
    
    public static Enigma rand(){
        Random random = new Random();
        Integer choosen = random.nextInt(Enigma.size());
        return read(choosen);
    }
    
   
}
