'use client';
/**사이트 전체에서 사용할 수 있는 인증 상태 관리 시스템 */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { getSession, timeLeftMs } from '@/lib/loginStorage';
import { fakeLogin, fakeLogout, currentSession } from '@/lib/fakeLogin';

/**전역 인증 상태를 공유할 Context 생성 */
export const LoginContext = createContext(null);

/**사이트 전체를 감싸는 Provider 컴포넌트 */
export default function LoginProvider({ children }) {
  const [ready, setReady] = useState(false); /**로그인 상태 파익(flicker방지) */
  const [user, setUser] =
    useState(
      null
    ); /**세션사용자(db erd에선 member인데 다른 코드에 user로 되어있어서 일단 맞춤) */
  const [loading, setLoading] = useState(true); /**로그인/로그아웃 표시*/
  const timerRef = useRef(null);

  /**마운트시 세션복원 */
  useEffect(() => {
    const s = getSession();
    setUser(s?.user ?? null); /**세션 있으면 member정보 사용 */
    setLoading(false);
    setReady(true);
  }, []);

  /**만료 자동 감지(1초마다)*/
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      /*timeLeftMs()가 0이면 만료 →user 제거*/
      if (timeLeftMs() <= 0) {
        if (user) setUser(null);
      }
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [user]); /**user 변경시마다 타이머 재설정 */

  /**탭 간 동기화(탭1에서 로그아웃하면 탭2에서도 로그아웃)*/
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== 'login') return;
      const s = getSession();
      setUser(s?.user ?? null);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  /**로그인*/
  const doLogin = async ({
    login_id = '',
    password = '',
    remember = false,
  } = {}) => {
    setLoading(true);
    try {
      const s = fakeLogin({ login_id: login_id, password: password, remember });
      setUser(s.user);
      return s;
    } finally {
      setLoading(false);
    }
  };
  /**로그아웃 */
  const logout = async () => {
    setLoading(true);
    try {
      fakeLogout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  /**세로고침(동기화 유지) */
  const refresh = () => {
    const s = currentSession();
    setUser(s?.user ?? null);
    return s;
  };

  const value = useMemo(
    () => ({
      ready,
      loading,
      user,
      isLogined: !!user,
      doLogin,
      logout,
      refresh,
    }),
    [ready, loading, user]
  );

  return (
    <LoginContext.Provider value={value}>{children}</LoginContext.Provider>
  );
}
