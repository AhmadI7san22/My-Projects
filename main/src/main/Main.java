package main;
// Football Club Management System Project.
import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Scanner;


abstract class Player {
    private String name;
    private double salary;
    private int contractLength;
    private int jerseyNumber;

   
    public Player(String name, double salary, int contractLength, int jerseyNumber) {
        this.name = name;
        this.salary = salary;
        this.contractLength = contractLength;
        this.jerseyNumber = jerseyNumber;
    }

    
    public String getName() {
        return name;
    }

    public double getSalary() {
        return salary;
    }

    public int getContractLength() {
        return contractLength;
    }

    public int getJerseyNumber() {
        return jerseyNumber;
    }

    
    public abstract String getPlayerType();
}


class Goalkeeper extends Player {
    private int cleanSheets;

    
    public Goalkeeper(String name, double salary, int contractLength, int jerseyNumber, int cleanSheets) {
        super(name, salary, contractLength, jerseyNumber);
        this.cleanSheets = cleanSheets;
    }

    
    public int getCleanSheets() {
        return cleanSheets;
    }

    
    @Override
    public String getPlayerType() {
        return "Goalkeeper";
    }
}


class Defender extends Player {
    private int tackles;

    
    public Defender(String name, double salary, int contractLength, int jerseyNumber, int tackles) {
        super(name, salary, contractLength, jerseyNumber);
        this.tackles = tackles;
    }

    
    public int getTackles() {
        return tackles;
    }

   
    @Override
    public String getPlayerType() {
        return "Defender";
    }
}


class Midfielder extends Player {
    private int assists;

    
    public Midfielder(String name, double salary, int contractLength, int jerseyNumber, int assists) {
        super(name, salary, contractLength, jerseyNumber);
        this.assists = assists;
    }

    
    public int getAssists() {
        return assists;
    }

    
    @Override
    public String getPlayerType() {
        return "Midfielder";
    }
}


class Forward extends Player {
    private int goals;

    
    public Forward(String name, double salary, int contractLength, int jerseyNumber, int goals) {
        super(name, salary, contractLength, jerseyNumber);
        this.goals = goals;
    }

    
    public int getGoals() {
        return goals;
    }

    
    @Override
    public String getPlayerType() {
        return "Forward";
    }
}


class InvalidPlayerTypeException extends Exception {
    public InvalidPlayerTypeException(String message) {
        super(message);
    }
}


class InvalidInputException extends Exception {
    public InvalidInputException(String message) {
        super(message);
    }
}


class Coach {
    private String name;
    private String nationality;
    private int age;

  
    public Coach(String name, String nationality, int age) {
        this.name = name;
        this.nationality = nationality;
        this.age = age;
    }

   
    public String getName() {
        return name;
    }

    public String getNationality() {
        return nationality;
    }

    public int getAge() {
        return age;
    }
}


class Stadium {
    private String name;
    private String location;
    private int capacity;

    
    public Stadium(String name, String location, int capacity) {
        this.name = name;
        this.location = location;
        this.capacity = capacity;
    }

   
    public String getName() {
        return name;
    }

    public String getLocation() {
        return location;
    }

    public int getCapacity() {
        return capacity;
    }
}

class Team {
    private String name;
    private String owner;
    private double value;
    private Coach coach;
    private Stadium stadium;
    private int cups;
    private ArrayList<Player> players;

  
    public Team(String name, String owner, double value) {
        this.name = name;
        this.owner = owner;
        this.value = value;
        this.players = new ArrayList<>();
    }

    
    public void addPlayer(Player player) {
        players.add(player);
    }

   
    public void setCoach(Coach coach) {
        this.coach = coach;
    }

    
    public void setStadium(Stadium stadium) {
        this.stadium = stadium;
    }

    
    public void setCups(int cups) {
        this.cups = cups;
    }

    public String getName() {
        return name;
    }

    public String getOwner() {
        return owner;
    }

    public double getValue() {
        return value;
    }

    public Coach getCoach() {
        return coach;
    }

    public Stadium getStadium() {
        return stadium;
    }

    public int getCups() {
        return cups;
    }

    public ArrayList<Player> getPlayers() {
        return players;
    }
}

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        // Welcome message
        System.out.println("Welcome to the Football Team Management System!");

        // Team details
        System.out.println("\nEnter the name of the team:");
        String teamName = scanner.nextLine();
        System.out.println("Enter the name of the club owner:");
        String ownerName = scanner.nextLine();
        System.out.println("Enter the value of the team:");
        double teamValue = scanner.nextDouble();
        scanner.nextLine(); 

        Team team = new Team(teamName, ownerName, teamValue);

        int choice;
        do {
            
            System.out.println("\nMain Menu:");
            System.out.println("1. Add Player");
            System.out.println("2. Add Coach");
            System.out.println("3. Add Stadium");
            System.out.println("4. Add Cups");
            System.out.println("5. View Team Details");
            System.out.println("6. Save Team Details");
            System.out.println("7. Exit");
            System.out.print("Enter your choice: ");
            choice = scanner.nextInt();
            scanner.nextLine(); 

            switch (choice) {
                case 1:
                    try {
                        
                        System.out.println("\nEnter player details:");
                        System.out.print("Name: ");
                        String playerName = scanner.nextLine();
                        System.out.print("Salary: ");
                        double playerSalary = scanner.nextDouble();
                        System.out.print("Contract Length (in years): ");
                        int contractLength = scanner.nextInt();
                        System.out.print("Jersey Number: ");
                        int jerseyNumber = scanner.nextInt();
                        scanner.nextLine(); // Consume newline

                        System.out.print("Enter player type (Goalkeeper/Defender/Midfielder/Forward): ");
                        String playerType = scanner.nextLine();

                        Player newPlayer;
                        switch (playerType.toLowerCase()) {
                            case "goalkeeper":
                                System.out.print("Enter clean sheets: ");
                                int cleanSheets = scanner.nextInt();
                                newPlayer = new Goalkeeper(playerName, playerSalary, contractLength, jerseyNumber, cleanSheets);
                                break;
                            case "defender":
                                System.out.print("Enter tackles: ");
                                int tackles = scanner.nextInt();
                                newPlayer = new Defender(playerName, playerSalary, contractLength, jerseyNumber, tackles);
                                break;
                            case "midfielder":
                                System.out.print("Enter assists: ");
                                int assists = scanner.nextInt();
                                newPlayer = new Midfielder(playerName, playerSalary, contractLength, jerseyNumber, assists);
                                break;
                            case "forward":
                                System.out.print("Enter goals: ");
                                int goals = scanner.nextInt();
                                newPlayer = new Forward(playerName, playerSalary, contractLength, jerseyNumber, goals);
                                break;
                            default:
                                throw new InvalidPlayerTypeException("Invalid player type entered!");
                        }

                        team.addPlayer(newPlayer);
                        System.out.println("Player added successfully!");
                    } catch (InvalidPlayerTypeException | java.util.InputMismatchException ex) {
                        System.out.println("Error: " + ex.getMessage());
                        scanner.nextLine(); // Clear input buffer
                    }
                    break;

                case 2:
                    // Add Coach
                    System.out.println("\nEnter coach details:");
                    System.out.print("Name: ");
                    String coachName = scanner.nextLine();
                    System.out.print("Nationality: ");
                    String nationality = scanner.nextLine();
                    System.out.print("Age: ");
                    int age = scanner.nextInt();
                    scanner.nextLine(); // Consume newline
                    team.setCoach(new Coach(coachName, nationality, age));
                    System.out.println("Coach added successfully!");
                    break;

                case 3:
                    // Add Stadium
                    System.out.println("\nEnter stadium details:");
                    System.out.print("Name: ");
                    String stadiumName = scanner.nextLine();
                    System.out.print("Location: ");
                    String location = scanner.nextLine();
                    System.out.print("Capacity: ");
                    int capacity = scanner.nextInt();
                    scanner.nextLine(); // Consume newline
                    team.setStadium(new Stadium(stadiumName, location, capacity));
                    System.out.println("Stadium added successfully!");
                    break;

                case 4:
                    // Add Cups
                    System.out.print("\nEnter number of cups: ");
                    int cups = scanner.nextInt();
                    team.setCups(cups);
                    System.out.println("Cups added successfully!");
                    break;

                case 5:
                    // View Team Details
                    System.out.println("\nTeam Details:");
                    System.out.println("Name: " + team.getName());
                    System.out.println("Club Owner: " + team.getOwner());
                    System.out.println("Value: " + team.getValue());
                    if (team.getCoach() != null) {
                        Coach coach = team.getCoach();
                        System.out.println("Coach: " + coach.getName() + ", Nationality: " + coach.getNationality() +
                                ", Age: " + coach.getAge());
                    }
                    if (team.getStadium() != null) {
                        Stadium stadium = team.getStadium();
                        System.out.println("Stadium: " + stadium.getName() + ", Location: " + stadium.getLocation() +
                                ", Capacity: " + stadium.getCapacity());
                    }
                    System.out.println("Cups: " + team.getCups());
                    System.out.println("Players:");
                    for (Player player : team.getPlayers()) {
                        System.out.println(" - Name: " + player.getName() + ", Salary: " + player.getSalary() +
                                ", Contract Length: " + player.getContractLength() + ", Jersey Number: " +
                                player.getJerseyNumber() + ", Player Type: " + player.getPlayerType());

                        // Additional details based on player type
                        if (player instanceof Goalkeeper) {
                            Goalkeeper goalkeeper = (Goalkeeper) player;
                            System.out.println("   Clean Sheets: " + goalkeeper.getCleanSheets());
                        } else if (player instanceof Defender) {
                            Defender defender = (Defender) player;
                            System.out.println("   Tackles: " + defender.getTackles());
                        } else if (player instanceof Midfielder) {
                            Midfielder midfielder = (Midfielder) player;
                            System.out.println("   Assists: " + midfielder.getAssists());
                        } else if (player instanceof Forward) {
                            Forward forward = (Forward) player;
                            System.out.println("   Goals: " + forward.getGoals());
                        }
                    }
                    break;

                case 6:
                    
              
                    // Save Team Details to File
                    saveTeamDetailsToFile(team);
                    break;
                    // Exit
                    //System.out.println("Exiting...");
                    //break;

                default:
                    System.out.println("Invalid choice. Please enter a number from 1 to 7.");
            }
        } while (choice != 7);

        scanner.close();
    }
    private static void saveTeamDetailsToFile(Team team) {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter("team_details.txt"))) {
            writer.write("Team Details:");
            writer.newLine();
            writer.write("Name: " + team.getName());
            writer.newLine();
            writer.write("Club Owner: " + team.getOwner());
            writer.newLine();
            writer.write("Value: " + team.getValue());
            writer.newLine();
            if (team.getCoach() != null) {
                Coach coach = team.getCoach();
                writer.write("Coach: " + coach.getName() + ", Nationality: " + coach.getNationality() +
                        ", Age: " + coach.getAge());
                writer.newLine();
            }
            if (team.getStadium() != null) {
                Stadium stadium = team.getStadium();
                writer.write("Stadium: " + stadium.getName() + ", Location: " + stadium.getLocation() +
                        ", Capacity: " + stadium.getCapacity());
                writer.newLine();
            }
            writer.write("Cups: " + team.getCups());
            writer.newLine();
            writer.write("Players:");
            writer.newLine();
            for (Player player : team.getPlayers()) {
                writer.write(" - Name: " + player.getName() + ", Salary: " + player.getSalary() +
                        ", Contract Length: " + player.getContractLength() + ", Jersey Number: " +
                        player.getJerseyNumber() + ", Player Type: " + player.getPlayerType());
                writer.newLine();

                // Additional details based on player type
                if (player instanceof Goalkeeper) {
                    Goalkeeper goalkeeper = (Goalkeeper) player;
                    writer.write("   Clean Sheets: " + goalkeeper.getCleanSheets());
                    writer.newLine();
                } else if (player instanceof Defender) {
                    Defender defender = (Defender) player;
                    writer.write("   Tackles: " + defender.getTackles());
                    writer.newLine();
                } else if (player instanceof Midfielder) {
                    Midfielder midfielder = (Midfielder) player;
                    writer.write("   Assists: " + midfielder.getAssists());
                    writer.newLine();
                } else if (player instanceof Forward) {
                    Forward forward = (Forward) player;
                    writer.write("   Goals: " + forward.getGoals());
                    writer.newLine();
                }
            }
            System.out.println("Team details written to file 'team_details.txt'.");
        } catch (IOException e) {
            System.out.println("An error occurred while writing team details to file: " + e.getMessage());
        }
    }
}

