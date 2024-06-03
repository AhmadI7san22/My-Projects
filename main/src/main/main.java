/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/GUIForms/JFrame.java to edit this template
 */
package main;
import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.FileWriter;
import java.util.ArrayList;
import java.util.Scanner;



/**
 *
 * @author ahmad
 */
public class main extends javax.swing.JFrame {
    private Team team;
    
    
    public main() {
        setTitle("Football Team Management System");
        setSize(800, 600);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setLayout(new CardLayout());

        JPanel teamDetailsPanel = createTeamDetailsPanel();
        JPanel mainMenuPanel = createMainMenuPanel();
        JPanel addPlayerPanel = createAddPlayerPanel();
        JPanel addCoachPanel = createAddCoachPanel();
        JPanel addStadiumPanel = createAddStadiumPanel();
        JPanel addCupsPanel = createAddCupsPanel();
        JPanel viewTeamDetailsPanel = createViewTeamDetailsPanel();

        add("Team Details", teamDetailsPanel);
        add("Main Menu", mainMenuPanel);
        add("Add Player", addPlayerPanel);
        add("Add Coach", addCoachPanel);
        add("Add Stadium", addStadiumPanel);
        add("Add Cups", addCupsPanel);
        add("View Team Details", viewTeamDetailsPanel);

        setVisible(true);
    }

 
    @SuppressWarnings("unchecked")
    // <editor-fold defaultstate="collapsed" desc="Generated Code">//GEN-BEGIN:initComponents
    private void initComponents() {

        setDefaultCloseOperation(javax.swing.WindowConstants.EXIT_ON_CLOSE);

        javax.swing.GroupLayout layout = new javax.swing.GroupLayout(getContentPane());
        getContentPane().setLayout(layout);
        layout.setHorizontalGroup(
            layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGap(0, 400, Short.MAX_VALUE)
        );
        layout.setVerticalGroup(
            layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGap(0, 300, Short.MAX_VALUE)
        );

        pack();
    }// </editor-fold>//GEN-END:initComponents

    /**
     * @param args the command line arguments
     */
    public static void main(String args[]) {
        
        
        
        
         Scanner scanner = new Scanner(System.in);
        FileWriter writer = null;
        
        
        
       SwingUtilities.invokeLater(Main::new);

        /* Create and display the form */
        java.awt.EventQueue.invokeLater(new Runnable() {
            public void run() {
                new main().setVisible(true);
            }
        });
    }

    // Variables declaration - do not modify//GEN-BEGIN:variables
    // End of variables declaration//GEN-END:variables


private JPanel createTeamDetailsPanel() {
        JPanel panel = new JPanel(new GridLayout(4, 2));
        JLabel nameLabel = new JLabel("Team Name:");
        JTextField nameField = new JTextField();
        JLabel ownerLabel = new JLabel("Owner Name:");
        JTextField ownerField = new JTextField();
        JLabel valueLabel = new JLabel("Team Value:");
        JTextField valueField = new JTextField();
        JButton submitButton = new JButton("Submit");

        panel.add(nameLabel);
        panel.add(nameField);
        panel.add(ownerLabel);
        panel.add(ownerField);
        panel.add(valueLabel);
        panel.add(valueField);
        panel.add(submitButton);

        submitButton.addActionListener(e -> {
            String name = nameField.getText();
            String owner = ownerField.getText();
            double value = Double.parseDouble(valueField.getText());
            team = new Team(name, owner, value);

            CardLayout cl = (CardLayout) getContentPane().getLayout();
            cl.show(getContentPane(), "Main Menu");
        });

        return panel;
    }

    private JPanel createMainMenuPanel() {
        JPanel panel = new JPanel(new GridLayout(6, 1));
        JButton addPlayerButton = new JButton("Add Player");
        JButton addCoachButton = new JButton("Add Coach");
        JButton addStadiumButton = new JButton("Add Stadium");
        JButton addCupsButton = new JButton("Add Cups");
        JButton viewTeamDetailsButton = new JButton("View Team Details");
        JButton exitButton = new JButton("Exit");

        panel.add(addPlayerButton);
        panel.add(addCoachButton);
        panel.add(addStadiumButton);
        panel.add(addCupsButton);
        panel.add(viewTeamDetailsButton);
        panel.add(exitButton);

        CardLayout cl = (CardLayout) getContentPane().getLayout();

        addPlayerButton.addActionListener(e -> cl.show(getContentPane(), "Add Player"));
        addCoachButton.addActionListener(e -> cl.show(getContentPane(), "Add Coach"));
        addStadiumButton.addActionListener(e -> cl.show(getContentPane(), "Add Stadium"));
        addCupsButton.addActionListener(e -> cl.show(getContentPane(), "Add Cups"));
        viewTeamDetailsButton.addActionListener(e -> {
            updateViewTeamDetailsPanel((JPanel) getContentPane().getComponent(6));
            cl.show(getContentPane(), "View Team Details");
        });
        exitButton.addActionListener(e -> System.exit(0));

        return panel;
    }

    private JPanel createAddPlayerPanel() {
        JPanel panel = new JPanel(new GridLayout(9, 2));
        JLabel nameLabel = new JLabel("Name:");
        JTextField nameField = new JTextField();
        JLabel salaryLabel = new JLabel("Salary:");
        JTextField salaryField = new JTextField();
        JLabel contractLengthLabel = new JLabel("Contract Length:");
        JTextField contractLengthField = new JTextField();
        JLabel jerseyNumberLabel = new JLabel("Jersey Number:");
        JTextField jerseyNumberField = new JTextField();
        JLabel playerTypeLabel = new JLabel("Player Type:");
        JComboBox<String> playerTypeComboBox = new JComboBox<>(new String[]{"Goalkeeper", "Defender", "Midfielder", "Forward"});
        JLabel extraLabel = new JLabel();
        JTextField extraField = new JTextField();
        JButton submitButton = new JButton("Submit");
        JButton backButton = new JButton("Back");

        panel.add(nameLabel);
        panel.add(nameField);
        panel.add(salaryLabel);
        panel.add(salaryField);
        panel.add(contractLengthLabel);
        panel.add(contractLengthField);
        panel.add(jerseyNumberLabel);
        panel.add(jerseyNumberField);
        panel.add(playerTypeLabel);
        panel.add(playerTypeComboBox);
        panel.add(extraLabel);
        panel.add(extraField);
        panel.add(submitButton);
        panel.add(backButton);

        extraLabel.setText("Clean Sheets:");

        playerTypeComboBox.addActionListener(e -> {
            String selected = (String) playerTypeComboBox.getSelectedItem();
            switch (selected) {
                case "Goalkeeper":
                    extraLabel.setText("Clean Sheets:");
                    break;
                case "Defender":
                    extraLabel.setText("Tackles:");
                    break;
                case "Midfielder":
                    extraLabel.setText("Assists:");
                    break;
                case "Forward":
                    extraLabel.setText("Goals:");
                    break;
            }
        });

        submitButton.addActionListener(e -> {
            try {
                String name = nameField.getText();
                double salary = Double.parseDouble(salaryField.getText());
                int contractLength = Integer.parseInt(contractLengthField.getText());
                int jerseyNumber = Integer.parseInt(jerseyNumberField.getText());
                String playerType = (String) playerTypeComboBox.getSelectedItem();
                int extraValue = Integer.parseInt(extraField.getText());

                Player player;
                switch (playerType) {
                    case "Goalkeeper":
                        player = new Goalkeeper(name, salary, contractLength, jerseyNumber, extraValue);
                        break;
                    case "Defender":
                        player = new Defender(name, salary, contractLength, jerseyNumber, extraValue);
                        break;
                    case "Midfielder":
                        player = new Midfielder(name, salary, contractLength, jerseyNumber, extraValue);
                        break;
                    case "Forward":
                        player = new Forward(name, salary, contractLength, jerseyNumber, extraValue);
                        break;
                    default:
                        throw new InvalidPlayerTypeException("Invalid player type entered!");
                }

                team.addPlayer(player);
                JOptionPane.showMessageDialog(panel, "Player added successfully!");
                clearFields(nameField, salaryField, contractLengthField, jerseyNumberField, extraField);
            } catch (InvalidPlayerTypeException | NumberFormatException ex) {
                JOptionPane.showMessageDialog(panel, "Error: " + ex.getMessage());
            }
        });

        backButton.addActionListener(e -> {
            CardLayout cl = (CardLayout) getContentPane().getLayout();
            cl.show(getContentPane(), "Main Menu");
        });

        return panel;
    }

    private JPanel createAddCoachPanel() {
        JPanel panel = new JPanel(new GridLayout(5, 2));
        JLabel nameLabel = new JLabel("Name:");
        JTextField nameField = new JTextField();
        JLabel nationalityLabel = new JLabel("Nationality:");
        JTextField nationalityField = new JTextField();
        JLabel ageLabel = new JLabel("Age:");
        JTextField ageField = new JTextField();
        JButton submitButton = new JButton("Submit");
        JButton backButton = new JButton("Back");

        panel.add(nameLabel);
        panel.add(nameField);
        panel.add(nationalityLabel);
        panel.add(nationalityField);
        panel.add(ageLabel);
        panel.add(ageField);
        panel.add(submitButton);
        panel.add(backButton);

        submitButton.addActionListener(e -> {
            String name = nameField.getText();
            String nationality = nationalityField.getText();
            int age = Integer.parseInt(ageField.getText());
            Coach coach = new Coach(name, nationality, age);
            team.setCoach(coach);
            JOptionPane.showMessageDialog(panel, "Coach added successfully!");
            clearFields(nameField, nationalityField, ageField);
        });

        backButton.addActionListener(e -> {
            CardLayout cl = (CardLayout) getContentPane().getLayout();
            cl.show(getContentPane(), "Main Menu");
        });

        return panel;
    }

    private JPanel createAddStadiumPanel() {
        JPanel panel = new JPanel(new GridLayout(5, 2));
        JLabel nameLabel = new JLabel("Name:");
        JTextField nameField = new JTextField();
        JLabel locationLabel = new JLabel("Location:");
        JTextField locationField = new JTextField();
        JLabel capacityLabel = new JLabel("Capacity:");
        JTextField capacityField = new JTextField();
        JButton submitButton = new JButton("Submit");
        JButton backButton = new JButton("Back");

        panel.add(nameLabel);
        panel.add(nameField);
        panel.add(locationLabel);
        panel.add(locationField);
        panel.add(capacityLabel);
        panel.add(capacityField);
        panel.add(submitButton);
        panel.add(backButton);

        submitButton.addActionListener(e -> {
            String name = nameField.getText();
            String location = locationField.getText();
            int capacity = Integer.parseInt(capacityField.getText());
            Stadium stadium = new Stadium(name, location, capacity);
            team.setStadium(stadium);
            JOptionPane.showMessageDialog(panel, "Stadium added successfully!");
            clearFields(nameField, locationField, capacityField);
        });

        backButton.addActionListener(e -> {
            CardLayout cl = (CardLayout) getContentPane().getLayout();
            cl.show(getContentPane(), "Main Menu");
        });

        return panel;
    }

    private JPanel createAddCupsPanel() {
        JPanel panel = new JPanel(new GridLayout(3, 2));
        JLabel cupsLabel = new JLabel("Number of Cups:");
        JTextField cupsField = new JTextField();
        JButton submitButton = new JButton("Submit");
        JButton backButton = new JButton("Back");

        panel.add(cupsLabel);
        panel.add(cupsField);
        panel.add(submitButton);
        panel.add(backButton);

        submitButton.addActionListener(e -> {
            int cups = Integer.parseInt(cupsField.getText());
            team.setCups(cups);
            JOptionPane.showMessageDialog(panel, "Cups added successfully!");
            clearFields(cupsField);
        });

        backButton.addActionListener(e -> {
            CardLayout cl = (CardLayout) getContentPane().getLayout();
            cl.show(getContentPane(), "Main Menu");
        });

        return panel;
    }

    private JPanel createViewTeamDetailsPanel() {
        JPanel panel = new JPanel();
        panel.setLayout(new BoxLayout(panel, BoxLayout.Y_AXIS));
        return panel;
    }

    private void updateViewTeamDetailsPanel(JPanel panel) {
        panel.removeAll();

        JLabel nameLabel = new JLabel("Name: " + team.getName());
        JLabel ownerLabel = new JLabel("Owner: " + team.getOwner());
        JLabel valueLabel = new JLabel("Value: " + team.getValue());
        panel.add(nameLabel);
        panel.add(ownerLabel);
        panel.add(valueLabel);

        if (team.getCoach() != null) {
            Coach coach = team.getCoach();
            JLabel coachLabel = new JLabel("Coach: " + coach.getName() + ", Nationality: " + coach.getNationality() + ", Age: " + coach.getAge());
            panel.add(coachLabel);
        }

        if (team.getStadium() != null) {
            Stadium stadium = team.getStadium();
            JLabel stadiumLabel = new JLabel("Stadium: " + stadium.getName() + ", Location: " + stadium.getLocation() + ", Capacity: " + stadium.getCapacity());
            panel.add(stadiumLabel);
        }

        JLabel cupsLabel = new JLabel("Cups: " + team.getCups());
        panel.add(cupsLabel);

        JLabel playersLabel = new JLabel("Players:");
        panel.add(playersLabel);

        for (Player player : team.getPlayers()) {
            JLabel playerLabel = new JLabel(" - Name: " + player.getName() + ", Salary: " + player.getSalary() + ", Contract Length: " + player.getContractLength() + ", Jersey Number: " + player.getJerseyNumber() + ", Player Type: " + player.getPlayerType());

            // Additional details based on player type
            if (player instanceof Goalkeeper) {
                Goalkeeper goalkeeper = (Goalkeeper) player;
                playerLabel.setText(playerLabel.getText() + ", Clean Sheets: " + goalkeeper.getCleanSheets());
            } else if (player instanceof Defender) {
                Defender defender = (Defender) player;
                playerLabel.setText(playerLabel.getText() + ", Tackles: " + defender.getTackles());
            } else if (player instanceof Midfielder) {
                Midfielder midfielder = (Midfielder) player;
                playerLabel.setText(playerLabel.getText() + ", Assists: " + midfielder.getAssists());
            } else if (player instanceof Forward) {
                Forward forward = (Forward) player;
                playerLabel.setText(playerLabel.getText() + ", Goals: " + forward.getGoals());
            }

            panel.add(playerLabel);
        }

        JButton backButton = new JButton("Back");
        panel.add(backButton);

        backButton.addActionListener(e -> {
            CardLayout cl = (CardLayout) getContentPane().getLayout();
            cl.show(getContentPane(), "Main Menu");
        });

        panel.revalidate();
        panel.repaint();
    }

    private void clearFields(JTextField... fields) {
        for (JTextField field : fields) {
            field.setText("");
        }
    }

    
}
