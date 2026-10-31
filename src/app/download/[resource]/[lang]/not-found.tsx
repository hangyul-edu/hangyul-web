import ResourceNotFound from "@/components/download/ResourceNotFound";

/**
 * /download?resource=<모르는 값> — 다른 자료를 내려주지 않고 안내만 합니다. (404)
 * not-found는 params를 받지 못하므로, 레이아웃이 넘긴 화면 언어 메시지로
 * 클라이언트 컴포넌트에서 렌더링합니다.
 */
export default function NotFound() {
  return <ResourceNotFound />;
}
