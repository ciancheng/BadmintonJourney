# Badminton Journey Backend

Spring Boot backend application for the Badminton Journey project.

## Project Structure

This is a Maven-based project with the following structure:

```
backend/
├── src/
│   ├── main/
│   │   ├── java/               # Java source files
│   │   │   └── com/badmintonjourney/
│   │   │       ├── config/     # Configuration classes
│   │   │       ├── controller/ # REST controllers
│   │   │       ├── dto/        # Data Transfer Objects
│   │   │       ├── entity/     # JPA entities
│   │   │       ├── repository/ # Data repositories
│   │   │       ├── security/   # Security components
│   │   │       ├── service/    # Business logic
│   │   │       └── utils/      # Utility classes
│   │   └── resources/          # Application resources
│   │       └── application.yml # Application configuration
│   └── test/
│       ├── java/               # Test source files
│       └── resources/          # Test resources
├── target/                     # Build output directory
│   ├── classes/               # Compiled classes
│   └── test-classes/          # Compiled test classes
├── pom.xml                    # Maven configuration
└── README.md                  # This file
```

## Maven Configuration

The `pom.xml` file explicitly defines:

- **Source Directories**: 
  - Main: `src/main/java`
  - Test: `src/test/java`
- **Resource Directories**:
  - Main: `src/main/resources`
  - Test: `src/test/resources`
- **Output Directories**:
  - Main: `target/classes`
  - Test: `target/test-classes`

## Build and Run

```bash
# Clean and build the project
mvn clean install

# Run the application
mvn spring-boot:run

# Run tests
mvn test

# Package as JAR
mvn package
```

## Dependencies

- Spring Boot 2.7.14
- Spring Security with JWT
- Spring Data JPA
- H2 Database (default)
- MySQL Connector (optional)
- Lombok
- Validation

## Configuration

Application configuration is in `src/main/resources/application.yml`:
- Default port: 8080
- Context path: /api
- Database: H2 (file-based)
- File uploads: ./uploads directory 