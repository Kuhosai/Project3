FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy the JAR file from target directory
COPY target/*.jar app.jar

# Expose port 8080
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
