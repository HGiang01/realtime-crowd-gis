package me.gianghn.realtimecrowdgis.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
import com.fasterxml.jackson.databind.jsontype.PolymorphicTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {
    public static final String TILE_MODULE = "tile:";
    public static final String OTP_MODULE = "otp:";

    public static String genTileKey(int z, int x, int y) {
        return TILE_MODULE + z + ":" + x + ":" + y;
    }

    public static String genTileKey(String sub, int z, int x, int y) {
        return TILE_MODULE + sub + ":" + z + ":" + x + ":" + y;
    }

    public static String genOtpKey(String identifier) {
        return OTP_MODULE + identifier;
    }

    public static String genOtpKey(String sub, String identifier) {
        return OTP_MODULE + sub + ":" + identifier;
    }

    // Config for general purpose (Object)
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());

        PolymorphicTypeValidator ptv = BasicPolymorphicTypeValidator.builder()
                                                                    .allowIfBaseType(Object.class)
                                                                    .build();

        ObjectMapper objectMapper = JsonMapper.builder()
                                              .addModule(new JavaTimeModule()) // Support date time
                                              .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                                              .activateDefaultTyping(ptv,
                                                                     ObjectMapper.DefaultTyping.NON_FINAL) // Save object type info for deserialization
                                              .build();

        GenericJackson2JsonRedisSerializer jsonSerializer = new GenericJackson2JsonRedisSerializer(objectMapper);

        template.setValueSerializer(jsonSerializer);
        template.setHashValueSerializer(jsonSerializer);

        return template;
    }

    // Config for tile cache (byte[])
    @Bean
    public RedisTemplate<String, byte[]> redisBytesTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, byte[]> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(RedisSerializer.byteArray());
        return template;
    }
}