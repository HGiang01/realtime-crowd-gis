package me.gianghn.realtimecrowdgis.security.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import me.gianghn.realtimecrowdgis.dto.AuthDTO;
import me.gianghn.realtimecrowdgis.entity.User;
import me.gianghn.realtimecrowdgis.repository.UserRepository;
import me.gianghn.realtimecrowdgis.service.TokenService;
import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final TokenService tokenService;

    private final HandlerExceptionResolver exceptionResolver;

    public JwtAuthenticationFilter(
            TokenService tokenService,
            UserRepository userRepository,
            @Qualifier("handlerExceptionResolver") HandlerExceptionResolver exceptionResolver
    ) {
        this.tokenService = tokenService;
        this.exceptionResolver = exceptionResolver;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                // Extract token from Authorization header
                AuthDTO.AccessTokenInfo accessTokenInfo = tokenService.extractBearerToken(authHeader);
                UUID userId = accessTokenInfo.userId();
                User.UserRole role = accessTokenInfo.role();

                // Add role for user
                List<GrantedAuthority> authorities = AuthorityUtils.createAuthorityList("ROLE_" + role.name()
                                                                                                      .toUpperCase());

                // Set authentication in SecurityContext
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userId,
                                                                                                             null,
                                                                                                             authorities);
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            // throw exception into DispatcherServlet (@RestControllerAdvice)
            exceptionResolver.resolveException(request, response, null, e);
            return;
        }

        filterChain.doFilter(request, response);
    }
}


