<template>
  <v-app>
    <v-main class="bg-gradient d-flex align-center justify-center">
      <!-- 고정 크기 메신저 프레임 -->
      <div class="messenger-shell">
        <v-card class="messenger-card">
          <!-- 상단 헤더 -->
          <v-card-title
            class="d-flex align-center justify-space-between py-3 px-4"
          >
            <div class="d-flex align-center">
              <v-avatar size="32" class="mr-3">
                <v-img
                  src="https://avatars.githubusercontent.com/u/9919?s=64&v=4"
                  alt="Me"
                />
              </v-avatar>
              <div>
                <div class="text-subtitle-1 font-weight-medium">
                  Mono Messenger
                </div>
                <div class="text-caption text-medium-emphasis">
                  온라인 · {{ onlineCount }}명
                </div>
              </div>
            </div>

            <div class="d-flex align-center">
              <v-btn
                icon="mdi-minus"
                variant="text"
                size="small"
                class="mr-1"
              />
              <v-btn
                icon="mdi-cog-outline"
                variant="text"
                size="small"
                class="mr-1"
              />
              <v-btn icon="mdi-close" variant="text" size="small" />
            </div>
          </v-card-title>

          <v-divider />

          <!-- 검색바 -->
          <div class="px-3 pt-2 pb-1">
            <v-text-field
              v-model="search"
              density="compact"
              prepend-inner-icon="mdi-magnify"
              placeholder="친구 검색"
              variant="solo-filled"
              hide-details
              rounded="lg"
            />
          </div>

          <!-- 친구 리스트 -->
          <v-list class="friend-list" density="comfortable" lines="two">
            <v-list-item
              v-for="friend in filteredFriends"
              :key="friend.id"
              class="friend-item"
              min-height="64"
              rounded
              @click="selectFriend(friend)"
              @contextmenu.prevent="openContextMenu($event, friend)"
            >
              <!-- 아바타 -->
              <template #prepend>
                <v-avatar size="36">
                  <v-img :src="friend.avatar" :alt="friend.name" />
                </v-avatar>
              </template>

              <!-- 이름 + 뱃지 -->
              <v-list-item-title class="d-flex align-center">
                <span class="text-body-2 font-weight-medium">
                  {{ friend.name }}
                </span>
                <v-icon
                  v-if="friend.isOnline"
                  size="14"
                  class="ml-1 text-success"
                >
                  mdi-circle
                </v-icon>

                <span v-if="friend.unread" class="unread-badge ml-auto">
                  {{ friend.unread }}
                </span>
              </v-list-item-title>

              <!-- 마지막 메시지 + 시간 -->
              <v-list-item-subtitle class="d-flex align-center mt-1">
                <span class="text-truncate text-caption">
                  {{ friend.lastMessage }}
                </span>
                <span class="ml-auto text-caption text-medium-emphasis">
                  {{ friend.time }}
                </span>
              </v-list-item-subtitle>

              <!-- 뒤쪽 액션 버튼 -->
              <!-- <template #append>
                <v-btn
                  icon="mdi-dots-vertical"
                  variant="text"
                  size="small"
                  @click.stop="openContextMenu($event, friend)"
                />
              </template> -->
            </v-list-item>

            <div
              v-if="!filteredFriends.length"
              class="text-center text-caption text-medium-emphasis mt-6"
            >
              검색된 친구가 없습니다.
            </div>
          </v-list>

          <v-divider />

          <!-- 하단 액션바 -->
          <v-card-actions class="px-4 py-3 justify-space-between">
            <div class="d-flex align-center">
              <v-btn
                icon="mdi-message-plus-outline"
                variant="text"
                size="small"
                class="mr-1"
              />
              <v-btn
                icon="mdi-account-plus-outline"
                variant="text"
                size="small"
                class="mr-1"
              />
              <v-btn icon="mdi-bell-off-outline" variant="text" size="small" />
            </div>

            <v-btn
              color="primary"
              size="small"
              rounded="pill"
              prepend-icon="mdi"
            >
              새 메시지
            </v-btn>
          </v-card-actions>
        </v-card>
      </div>

      <!-- 우클릭 컨텍스트 메뉴 (커스텀 구현) -->
      <div
        v-if="contextMenu.visible"
        class="context-menu-overlay"
        @click="closeContextMenu"
      >
        <div
          class="context-menu"
          :style="{
            top: contextMenu.y + 'px',
            left: contextMenu.x + 'px',
          }"
          @click.stop
        >
          <div class="context-menu-item" @click="handleOpenChat">채팅 열기</div>
          <div class="context-menu-item" @click="handlePinFriend">
            상단 고정
          </div>
          <div class="context-menu-item" @click="handleMuteFriend">
            알림 끄기
          </div>
          <div
            class="context-menu-item text-danger"
            @click="handleRemoveFriend"
          >
            친구 삭제
          </div>
        </div>
      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";

interface Friend {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  isOnline: boolean;
  avatar: string;
}

const friends = ref<Friend[]>([
  {
    id: 1,
    name: "지수",
    lastMessage: "오늘 저녁에 잠깐 통화 가능해?",
    time: "오후 1:12",
    unread: 2,
    isOnline: true,
    avatar: "https://i.pravatar.cc/100?img=15",
  },
  {
    id: 2,
    name: "개발팀 단톡방",
    lastMessage: "빌드 끝나면 배포만 하면 됩니다.",
    time: "오전 11:03",
    unread: 5,
    isOnline: true,
    avatar: "https://i.pravatar.cc/100?img=32",
  },
  {
    id: 3,
    name: "디자이너",
    lastMessage: "새 메신저 UI 시안 드렸어요 🙌",
    time: "어제",
    unread: 0,
    isOnline: false,
    avatar: "https://i.pravatar.cc/100?img=5",
  },
  {
    id: 4,
    name: "서버 담당",
    lastMessage: "로그 보니까 에러 하나 더 있어요.",
    time: "어제",
    unread: 1,
    isOnline: false,
    avatar: "https://i.pravatar.cc/100?img=23",
  },
  {
    id: 5,
    name: "테스터",
    lastMessage: "모바일에서 스크롤 튀는 이슈 있어요.",
    time: "2일 전",
    unread: 0,
    isOnline: false,
    avatar: "https://i.pravatar.cc/100?img=40",
  },
]);

const search = ref("");
const selectedFriend = ref<Friend | null>(null);

const filteredFriends = computed(() => {
  const keyword = search.value.trim().toLowerCase();
  if (!keyword) return friends.value;
  return friends.value.filter((f) => f.name.toLowerCase().includes(keyword));
});

const onlineCount = computed(
  () => friends.value.filter((f) => f.isOnline).length
);

function selectFriend(friend: Friend) {
  selectedFriend.value = friend;
}

const contextMenu = reactive<{
  visible: boolean;
  x: number;
  y: number;
  friend: Friend | null;
}>({
  visible: false,
  x: 0,
  y: 0,
  friend: null,
});

function openContextMenu(event: MouseEvent, friend: Friend) {
  event.preventDefault();
  contextMenu.visible = false;
  contextMenu.x = event.clientX;
  contextMenu.y = event.clientY;
  contextMenu.friend = friend;
  // 다음 tick에서 열어주면 위치가 안정적
  requestAnimationFrame(() => {
    contextMenu.visible = true;
  });
}

function closeContextMenu() {
  contextMenu.visible = false;
}

function handleOpenChat() {
  // 여기서 실제 채팅 화면으로 전환 로직 넣으면 됨
  closeContextMenu();
}

function handlePinFriend() {
  // 고정 처리 mock
  closeContextMenu();
}

function handleMuteFriend() {
  // 뮤트 처리 mock
  closeContextMenu();
}

function handleRemoveFriend() {
  // 삭제 mock
  closeContextMenu();
}
</script>

<style scoped>
.bg-gradient {
  background: radial-gradient(circle at top, #1f2937, #020617);
}

.messenger-shell {
  width: 320px;
  height: 700px;
}

.messenger-card {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 0 !important;
}

/* v-list 쪽이 남은 공간을 채우도록 */
.friend-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 !important;
}

/* 친구 아이템 스타일 */
.friend-item {
  margin-left: 0 !important;
  margin-right: 0 !important;
  width: 100% !important;
  padding-inline: 12px;
}

.friend-item:hover {
  background-color: rgba(148, 163, 184, 0.18);
}

.friend-item--active {
  background: linear-gradient(
    to right,
    rgba(59, 130, 246, 0.16),
    rgba(96, 165, 250, 0.08)
  );
  transform: translateY(-1px);
}

/* 마지막 메시지 줄 생략 */
.text-truncate {
  max-width: 150px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* 안 읽은 메시지 뱃지 */
.unread-badge {
  min-width: 18px;
  padding: 0 6px;
  border-radius: 999px;
  font-size: 11px;
  line-height: 18px;
  text-align: center;
  background-color: rgb(56, 189, 248);
  color: #0f172a;
  font-weight: 600;
}

.context-menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999; /* 맨 위에 오도록 */
}

.context-menu {
  position: absolute;
  min-width: 160px;
  padding: 4px 0;
  border-radius: 8px;
  background-color: #ffffff;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.25);
  font-size: 13px;
}

.context-menu-item {
  padding: 6px 14px;
  cursor: pointer;
  white-space: nowrap;
}

.context-menu-item:hover {
  background-color: #f3f4f6;
}

.context-menu-item.text-danger {
  color: #dc2626;
}
</style>
