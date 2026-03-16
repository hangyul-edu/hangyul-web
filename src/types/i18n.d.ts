import en from "../../messages/en.json";

// next-intl의 IntlMessages 인터페이스를 en.json 구조로 확장
// 이 선언 하나로 useTranslations()의 모든 키가 타입 체크됨
declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface IntlMessages extends Messages {}
}

type Messages = typeof en;
