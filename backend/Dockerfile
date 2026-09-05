FROM maven:3.9-eclipse-temurin-25-alpine AS build
WORKDIR /app

COPY settings.xml /usr/share/maven/conf/settings.xml

COPY pom.xml .

RUN --mount=type=cache,target=/root/.m2 mvn dependency:go-offline

COPY src ./src

RUN --mount=type=cache,target=/root/.m2 mvn clean package -DskipTests -T 1C

FROM eclipse-temurin:25-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]