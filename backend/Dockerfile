# Build stage
FROM maven:3.8.5-eclipse-temurin-17 AS build
WORKDIR /app

# 1. Copy only pom.xml first to download dependencies
COPY pom.xml .
# 2. This step caches the dependencies (this is what failed earlier)
RUN mvn dependency:go-offline -B

# 3. Now copy the source and build
COPY src ./src
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/target/banking-system-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]