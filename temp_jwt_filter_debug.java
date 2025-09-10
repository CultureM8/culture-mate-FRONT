package com.culturemate.culturemate_api.config;

import com.culturemate.culturemate_api.domain.member.MemberStatus;
import com.culturemate.culturemate_api.dto.AuthenticatedUser;
import com.culturemate.culturemate_api.service.LoginService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private final JwtUtil jwtUtil;
  private final LoginService loginService;

  @Override
  protected void doFilterInternal(
      HttpServletRequest request,
      HttpServletResponse response,
      FilterChain filterChain) throws ServletException, IOException {

    String requestURI = request.getRequestURI();
    String method = request.getMethod();
    
    log.info("JWT 필터 시작 - {} {}", method, requestURI);

    String token = getTokenFromRequest(request);
    log.info("토큰 추출 결과: {}", token != null ? "토큰 존재 (길이: " + token.length() + ")" : "토큰 없음");

    if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
      try {
        log.info("JWT 토큰 검증 시작");
        String username = jwtUtil.getUsernameFromToken(token);
        log.info("토큰에서 추출한 사용자명: {}", username);

        if (username != null && jwtUtil.validateToken(token, username)) {
          log.info("JWT 토큰 유효성 검증 성공");
          UserDetails userDetails = loginService.loadUserByUsername(username);
          log.info("사용자 정보 로드 성공: {}, 권한: {}", userDetails.getUsername(), userDetails.getAuthorities());

          // MemberStatus 검증 추가
          if (userDetails instanceof AuthenticatedUser) {
            AuthenticatedUser authenticatedUser = (AuthenticatedUser) userDetails;
            
            if (!isAllowedStatus(authenticatedUser.getStatus())) {
              log.warn("비활성 상태 사용자의 접근 시도: {} (상태: {})", 
                      username, authenticatedUser.getStatus());
              response.setStatus(HttpServletResponse.SC_FORBIDDEN);
              response.getWriter().write("{\"error\": \"계정이 비활성 상태입니다.\"}");
              return;
            }
            log.info("사용자 상태 검증 성공: {}", authenticatedUser.getStatus());
          }

          UsernamePasswordAuthenticationToken authentication =
            new UsernamePasswordAuthenticationToken(
              userDetails, null, userDetails.getAuthorities());

          authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
          SecurityContextHolder.getContext().setAuthentication(authentication);

          log.info("JWT 인증 완료 - 사용자: {}, 권한: {}", username, userDetails.getAuthorities());
        } else {
          log.warn("JWT 토큰 검증 실패 - 사용자명: {}", username);
        }
      } catch (Exception e) {
        log.error("JWT 토큰 처리 중 오류 발생 - 요청: {} {}", method, requestURI, e);
        // 토큰 검증 실패 시 로그만 남기고 계속 진행 (인증되지 않은 상태로)
      }
    } else {
      if (token == null) {
        log.info("토큰이 없음 - 인증되지 않은 요청으로 처리");
      } else {
        log.info("이미 인증된 상태 - SecurityContext에 인증 정보 존재");
      }
    }

    log.info("JWT 필터 완료 - 인증 상태: {}", 
        SecurityContextHolder.getContext().getAuthentication() != null ? "인증됨" : "인증되지 않음");

    filterChain.doFilter(request, response);
  }

  /**
   * HTTP 요청에서 JWT 토큰 추출
   */
  private String getTokenFromRequest(HttpServletRequest request) {
    String bearerToken = request.getHeader("Authorization");
    if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
      return bearerToken.substring(7);
    }
    return null;
  }

  /**
   * MemberStatus 허용 여부 검증
   */
  private boolean isAllowedStatus(MemberStatus status) {
    return switch (status) {
      case ACTIVE -> true;          // 정상 - 전체 기능 허용
      case DORMANT -> true;         // 휴면 - 기본 기능만 허용 (추후 세분화 가능)
      case SUSPENDED -> false;      // 일시정지 - 접근 차단
      case BANNED -> false;         // 영구정지 - 접근 차단
      case DELETED -> false;        // 탈퇴 - 접근 차단
    };
  }
}
