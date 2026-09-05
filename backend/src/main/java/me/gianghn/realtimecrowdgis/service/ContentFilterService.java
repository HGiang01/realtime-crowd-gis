package me.gianghn.realtimecrowdgis.service;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.ahocorasick.trie.Emit;
import org.ahocorasick.trie.Trie;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

@Service
@Slf4j
public class ContentFilterService {
    private Trie trie;

    @PostConstruct
    public void initializeFilter() {
        Trie.TrieBuilder builder = Trie.builder()
                                       .ignoreCase()
                                       .ignoreOverlaps(); // Ignore overlapping matches to avoid duplicate detections

        try {
            // Read file path from resource folder
            ClassPathResource resource = new ClassPathResource("vn_offensive_words.txt");
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {

                String line;
                int loadedWordsCount = 0;

                while ((line = reader.readLine()) != null) {
                    String cleanWord = line.trim();
                    // Ignore empty words and start with #
                    if (!cleanWord.isEmpty() && !cleanWord.startsWith("#")) {
                        builder.addKeyword(cleanWord);
                        loadedWordsCount++;
                    }
                }

                // Build tree structure and store it in RAM
                this.trie = builder.build();
                log.info("Successfully loaded {} words into the Aho-Corasick Trie for content filtering.",
                         loadedWordsCount);
            }
        } catch (Exception e) {
            log.error("Failed to load words into the Aho-Corasick filter from file: {}", e.getMessage());
            // Initialize an empty tree as a fallback to prevent application crashes
            this.trie = Trie.builder().build();
        }
    }

    public boolean isValidContent(String text) {
        if (text == null || text.isBlank()) {
            return true;
        }
        Collection<Emit> matches = trie.parseText(text);
        return matches.isEmpty();
    }

    public Set<String> findOffensiveWords(String text) {
        Set<String> foundWords = new HashSet<>();
        if (text == null || text.isBlank()) {
            return foundWords;
        }

        Collection<Emit> matches = trie.parseText(text);
        for (Emit match : matches) {
            foundWords.add(match.getKeyword());
        }
        return foundWords;
    }
}
