package me.gianghn.realtimecrowdgis.config;

import me.gianghn.realtimecrowdgis.client.MartinClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.support.RestClientAdapter;
import org.springframework.web.service.invoker.HttpServiceProxyFactory;

@Configuration
public class HttpInterfaceConfig {
    @Value("${app.martin.url}")
    private String martinUrl;

    @Bean
    public MartinClient martinClient() {
        RestClient restClient = RestClient.builder()
                                          .baseUrl(martinUrl)
                                          .defaultStatusHandler(status -> status.value() == 404,
                                                                (request, response) -> {
                                                                })
                                          .build();

        RestClientAdapter adapter = RestClientAdapter.create(restClient);
        HttpServiceProxyFactory factory = HttpServiceProxyFactory.builderFor(adapter).build();

        return factory.createClient(MartinClient.class);
    }
}
