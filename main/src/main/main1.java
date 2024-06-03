package main;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Scanner;

public class main1 {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        FileWriter writer = null;

        try {
            // Create a FileWriter object
            writer = new FileWriter("team_management.txt");

            // Welcome message
            writer.write("Welcome to the Football Team Management System!\n");

            // Team details
            writer.write("\nEnter the name of the team:\n");
            String teamName = scanner.nextLine();
            writer.write(teamName + "\n");

            writer.write("Enter the name of the club owner:\n");
            String ownerName = scanner.nextLine();
            writer.write(ownerName + "\n");

            writer.write("Enter the value of the team:\n");
            double teamValue = scanner.nextDouble();
            scanner.nextLine(); // Consume newline
            writer.write(teamValue + "\n");

            int choice;
            do {
                // Main menu
                writer.write("\nMain Menu:\n");
                writer.write("1. Add Player\n");
                writer.write("2. Add Coach\n");
                writer.write("3. Add Stadium\n");
                writer.write("4. Add Cups\n");
                writer.write("5. View Team Details\n");
                writer.write("6. Exit\n");
                writer.write("Enter your choice: ");
                choice = scanner.nextInt();
                scanner.nextLine(); // Consume newline

                switch (choice) {
                    case 1:
                        // Add Player
                        writer.write("\nEnter player details:\n");
                        writer.write("Name: ");
                        String playerName = scanner.nextLine();
                        writer.write(playerName + "\n");
                        
                        // Add other player details...
                        // Repeat for salary, contract length, jersey number, and player type
                        // Depending on the player type, write specific details (e.g., clean sheets, tackles, etc.)

                        break;

                    case 2:
                        // Add Coach
                        writer.write("\nEnter coach details:\n");
                        writer.write("Name: ");
                        String coachName = scanner.nextLine();
                        writer.write(coachName + "\n");
                        
                        // Add other coach details...
                        // Repeat for nationality and age

                        break;

                    case 3:
                        // Add Stadium
                        writer.write("\nEnter stadium details:\n");
                        writer.write("Name: ");
                        String stadiumName = scanner.nextLine();
                        writer.write(stadiumName + "\n");
                        
                        // Add other stadium details...
                        // Repeat for location and capacity

                        break;

                    case 4:
                        // Add Cups
                        writer.write("\nEnter number of cups: ");
                        int cups = scanner.nextInt();
                        scanner.nextLine(); // Consume newline
                        writer.write(cups + "\n");
                        break;

                    case 5:
                        // View Team Details
                        // No need to save this option to the file as it's just for viewing
                        break;

                    case 6:
                        // Exit
                        writer.write("Exiting...\n");
                        break;

                    default:
                        writer.write("Invalid choice. Please enter a number from 1 to 6.\n");
                }
            } while (choice != 6);

            System.out.println("Data saved to team_management.txt successfully.");

        } catch (IOException e) {
            System.out.println("An error occurred while saving the data.");
            e.printStackTrace();
        } finally {
            try {
                if (writer != null) {
                    writer.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
            scanner.close();
        }
    }
}
