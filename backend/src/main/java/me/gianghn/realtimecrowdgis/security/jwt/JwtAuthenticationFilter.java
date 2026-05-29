package me.gianghn.realtimecrowdgis.security.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import me.gianghn.realtimecrowdgis.entity.User;
import me.gianghn.realtimecrowdgis.exception.specify.UserNotFoundException;
import me.gianghn.realtimecrowdgis.repository.UserRepository;
import me.gianghn.realtimecrowdgis.service.TokenService;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

import java.io.IOException;
import java.util.UUID;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final TokenService tokenService;
    private final UserRepository userRepository;

    private final HandlerExceptionResolver exceptionResolver;

    public JwtAuthenticationFilter(
            TokenService tokenService,
            UserRepository userRepository,
            @Qualifier("handlerExceptionResolver") HandlerExceptionResolver exceptionResolver
    ) {
        this.tokenService = tokenService;
        this.userRepository = userRepository;
        this.exceptionResolver = exceptionResolver;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        try {
            // Extract token from Authorization header
            String token = extractToken(request);

            if (token != null) {
                tokenService.verifyAccessToken(token);

                // Find user by id
                UUID userId = tokenService.getUserIdFromAccessToken(token);
                User user = userRepository.findById(userId)
                                          .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId, null));

                // Convert User to UserDetails (Spring security)
                UserDetails userDetails = org.springframework.security.core.userdetails.User.withUsername(user.getUsername())
                                                                                            .password("")
                                                                                            .authorities(user.getRole()
                                                                                                             .name())
                                                                                            .build();

                // Set authentication in SecurityContext
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            // throw exception into DispatcherServlet (@RestControllerAdvice)
            exceptionResolver.resolveException(request, response, null, e);
        }

        filterChain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest httpServletRequest) {
        String authHeader = httpServletRequest.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
}


