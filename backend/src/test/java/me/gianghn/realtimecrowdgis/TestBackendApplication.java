package me.gianghn.realtimecrowdgis;

import org.springframework.boot.SpringApplication;

public class TestBackendApplication {

    public static void main(String[] args) {
        SpringApplication.from(RealtimeCrowdGISApplication::main).with(TestcontainersConfiguration.class).run(args);
    }

}
