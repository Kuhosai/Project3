package com.urlshortener.service;

import org.springframework.stereotype.Service;

@Service
public class Base62EncodingService {

    private static final String BASE62_CHARACTERS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final int BASE = 62;

    /**
     * Encodes a Long ID to a Base62 short code
     *
     * @param id Database ID
     * @return Base62 encoded short code
     */
    public String encode(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("ID must be a positive number");
        }

        StringBuilder encoded = new StringBuilder();
        long num = id;

        while (num > 0) {
            int remainder = (int) (num % BASE);
            encoded.insert(0, BASE62_CHARACTERS.charAt(remainder));
            num = num / BASE;
        }

        return encoded.toString();
    }

    /**
     * Decodes a Base62 short code to a Long ID
     *
     * @param shortCode Base62 encoded short code
     * @return Decoded database ID
     */
    public Long decode(String shortCode) {
        if (shortCode == null || shortCode.isEmpty()) {
            throw new IllegalArgumentException("Short code cannot be null or empty");
        }

        long decoded = 0;
        for (int i = 0; i < shortCode.length(); i++) {
            char c = shortCode.charAt(i);
            int index = BASE62_CHARACTERS.indexOf(c);
            if (index == -1) {
                throw new IllegalArgumentException("Invalid character in short code: " + c);
            }
            decoded = decoded * BASE + index;
        }

        return decoded;
    }
}
