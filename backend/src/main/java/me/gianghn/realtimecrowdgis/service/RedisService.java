package me.gianghn.realtimecrowdgis.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
@RequiredArgsConstructor
public class RedisService {
    private final RedisTemplate<String, Object> redisTemplate;
    private final RedisTemplate<String, byte[]> redisBytesTemplate;

    @Value("${app.otp.expiration-mins}")
    private int otpExpirationMins;

    public void invalidatePendingTiles() {
        Set<String> keys = redisBytesTemplate.keys("tile:pending:*");

        if (!keys.isEmpty()) {
            redisBytesTemplate.delete(keys);
            log.info("Deleted {} tile cache in Redis", keys.size());
        }
    }

    public void invalidateProcessingTiles() {
        Set<String> keys = redisBytesTemplate.keys("tile:processing:*");

        if (!keys.isEmpty()) {
            redisBytesTemplate.delete(keys);
            log.info("Deleted {} tile cache in Redis", keys.size());
        }
    }

    public void set(String key, Object value, long timeout, TimeUnit timeUnit) {
        redisTemplate.opsForValue().set(key, value, timeout, timeUnit);
    }

    public void set(String key, Object value) {
        redisTemplate.opsForValue().set(key, value);
    }

    public void hashPutAll(String key, Map<String, Object> map) {
        redisTemplate.opsForHash().putAll(key, map);
    }

    public Object get(String key) {
        return redisTemplate.opsForValue().get(key);
    }

    public Object getHashKey(String key, String hashKey) {
        return redisTemplate.opsForHash().get(key, hashKey);
    }

    public void delete(String key) {
        redisTemplate.delete(key);
    }

    public boolean hasKey(String key) {
        return redisTemplate.hasKey(key);
    }

    public Long increment(String key) {
        return redisTemplate.opsForValue().increment(key);
    }

    public byte[] getBytes(String key) {
        return redisBytesTemplate.opsForValue().get(key);
    }

    public void setBytes(String key, byte[] value) {
        redisBytesTemplate.opsForValue().set(key, value);
    }

    public void setBytes(String key, byte[] value, long timeout, TimeUnit timeUnit) {
        redisBytesTemplate.opsForValue().set(key, value, timeout, timeUnit);
    }

    public boolean expire(String key, long timeout, TimeUnit timeUnit) {
        return redisTemplate.expire(key, timeout, timeUnit);
    }
}
