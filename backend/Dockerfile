FROM maven:3.9-eclipse-temurin-25-alpine AS build
WORKDIR /app

COPY pom.xml .

RUN --mount=type=cache,target=/root/.m2 mvn dependency:go-offline -q

COPY src ./src

RUN --mount=type=cache,target=/root/.m2 mvn clean package -DskipTests -q -T 1C

FROM eclipse-temurin:25-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]