// 이 파일을 config.js 로 복사한 뒤, Supabase 프로젝트의 실제 값으로 채운다.
// config.js는 .gitignore에 등록되어 저장소에 올라가지 않는다.
//
// 값은 Supabase 대시보드 > Project Settings > API 에서 확인한다.
// - url: Project URL
// - anonKey: anon public key (service_role key는 절대 여기 넣지 않는다)
window.SUPABASE_CONFIG = {
  url: "https://YOUR_PROJECT_REF.supabase.co",
  anonKey: "YOUR_ANON_PUBLIC_KEY",
};
