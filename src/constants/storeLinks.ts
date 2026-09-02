/**
 * 앱 스토어 링크
 *
 * 한귤 가나다는 이미 출시되어 있어 실제 스토어로 연결합니다.
 * 한귤 앱은 2026년 10월 9일(한글날) 정식 오픈 예정이며,
 * 출시 후 여기에 한귤 앱 링크를 추가하면 됩니다.
 */
export const GANADA_STORE_LINKS = {
  android:
    "https://play.google.com/store/apps/details?id=com.talkhangyul.ganada",
  ios: "https://apps.apple.com/us/app/hangyul-ganada/id6804839101",
} as const;

export type StorePlatform = keyof typeof GANADA_STORE_LINKS;
