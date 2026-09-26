// Correspondance Material Symbols (anciennes pages) → icônes du sprite (src/data/icons.ts).
// Couvre les ~150 noms les plus utilisés (>99 % des occurrences) ; les autres retombent sur « sparkles ».
const MAP: Record<string, string> = {
  arrow_forward: 'arrow-right', arrow_outward: 'arrow-up-right', arrow_back: 'arrow-left', arrow_right: 'arrow-right',
  trending_up: 'trending', insights: 'trending', monitoring: 'chart', analytics: 'chart', leaderboard: 'chart', query_stats: 'chart',
  check_circle: 'check-circle', check: 'check', verified: 'badge-check', verified_user: 'shield', gpp_good: 'shield',
  warning: 'alert', priority_high: 'alert', error: 'alert', cancel: 'x', close: 'x', remove_circle: 'x', block: 'x',
  mail: 'mail', forward_to_inbox: 'mail', mark_email_read: 'mail', alternate_email: 'mail', contact_mail: 'mail',
  smart_toy: 'bot', support_agent: 'headset', psychology: 'brain', auto_awesome: 'sparkles', science: 'sparkles',
  conversion_path: 'funnel', funnel: 'funnel', filter_alt: 'funnel', ads_click: 'target', target: 'target', my_location: 'target',
  forum: 'message', chat: 'message', chat_bubble: 'message', sms: 'message', question_answer: 'message', reviews: 'star',
  linked_services: 'workflow', account_tree: 'workflow', hub: 'workflow', webhook: 'workflow', api: 'code', integration_instructions: 'code',
  rocket_launch: 'rocket', bolt: 'zap', flash_on: 'zap', speed: 'gauge', timer: 'clock', schedule: 'clock', timelapse: 'clock', history: 'clock', update: 'clock', hourglass_disabled: 'clock',
  search_insights: 'search', search: 'search', manage_search: 'search', travel_explore: 'globe', troubleshoot: 'search',
  code: 'code', terminal: 'terminal', developer_board: 'code', developer_mode: 'code', deployed_code: 'code', memory: 'code',
  storefront: 'store', store: 'store', shopping_cart: 'cart', shopping_bag: 'cart', add_shopping_cart: 'cart', point_of_sale: 'cart', shopping_basket: 'cart', local_shipping: 'truck',
  payments: 'wallet', savings: 'wallet', account_balance_wallet: 'wallet', request_quote: 'file', receipt_long: 'file', euro: 'wallet', euro_symbol: 'wallet', price_check: 'wallet', currency_exchange: 'wallet', credit_card: 'card', payment: 'card', contactless: 'card',
  location_on: 'pin', location_city: 'building', apartment: 'building', corporate_fare: 'building', account_balance: 'building', domain: 'building', home_work: 'building', business_center: 'briefcase', work: 'briefcase',
  map: 'map', public: 'globe', language: 'globe', translate: 'globe', explore: 'compass', near_me: 'compass', directions: 'compass', route: 'route', timeline: 'route', stairs: 'route',
  shield: 'shield', security: 'shield', policy: 'shield', shield_lock: 'lock', lock: 'lock', lock_open: 'lock', key: 'key', vpn_key: 'key', password: 'key', fingerprint: 'lock',
  window: 'layout', web: 'layout', web_asset: 'layout', dashboard: 'layout', dashboard_customize: 'layers', view_carousel: 'layout', grid_view: 'layout', view_kanban: 'layout', widgets: 'layers', layers: 'layers', aspect_ratio: 'layout', apps: 'layout',
  link: 'link', share: 'link', call: 'phone', phone: 'phone', phone_iphone: 'smartphone', smartphone: 'smartphone', devices: 'smartphone', install_mobile: 'smartphone', contact_phone: 'phone', phone_in_talk: 'phone',
  menu_book: 'book', book: 'book', auto_stories: 'book', library_books: 'book', school: 'graduation', history_edu: 'graduation',
  photo_camera: 'camera', photo_camera_front: 'camera', image: 'images', photo: 'images', photo_library: 'images', collections: 'images',
  movie: 'video', music_video: 'video', videocam: 'video', smart_display: 'video', live_tv: 'video', movie_edit: 'video', play_arrow: 'play', play_circle: 'play', subscriptions: 'video', video_call: 'video',
  badge: 'idcard', group: 'users', groups: 'users', diversity_3: 'users', supervisor_account: 'users', person: 'users', person_add: 'users', co_present: 'users', handshake: 'handshake', waving_hand: 'handshake',
  help: 'help', info: 'info', article: 'newspaper', newspaper: 'newspaper', description: 'file', draft: 'file', edit_document: 'file', picture_as_pdf: 'file', assignment: 'file', fact_check: 'check-circle', checklist: 'check-circle', task_alt: 'check-circle',
  gavel: 'scale', balance: 'scale', scale: 'scale', format_quote: 'quote', star: 'star', stars: 'star', grade: 'star', workspace_premium: 'award', emoji_events: 'award', diamond: 'award', military_tech: 'award',
  calendar_month: 'calendar', calendar_today: 'calendar', today: 'calendar', event: 'calendar', event_available: 'calendar', edit_calendar: 'calendar',
  build: 'wrench', construction: 'wrench', handyman: 'wrench', engineering: 'wrench', build_circle: 'wrench', settings: 'sliders', tune: 'sliders', settings_suggest: 'sliders',
  campaign: 'megaphone', notifications_active: 'megaphone', visibility: 'eye', cloud: 'cloud', cloud_sync: 'cloud', cloud_upload: 'cloud', cloud_done: 'cloud', backup: 'cloud', storage: 'database', database: 'database', dns: 'database',
  favorite: 'heart', thumb_up: 'heart', volunteer_activism: 'heart', lightbulb: 'lightbulb', tips_and_updates: 'lightbulb', restaurant: 'utensils', local_fire_department: 'zap',
  download: 'download', file_download: 'download', cloud_download: 'download', refresh: 'refresh', autorenew: 'refresh', sync: 'refresh', sync_alt: 'refresh', restart_alt: 'refresh', published_with_changes: 'refresh',
  edit_note: 'pen', edit: 'pen', draw: 'pen', brush: 'palette', palette: 'palette', design_services: 'palette', animation: 'sparkles',
  send: 'send', schedule_send: 'send', flag: 'flag', redeem: 'gift', card_giftcard: 'gift', home: 'home', expand_more: 'chevron-down',
  strategy: 'compass', precision_manufacturing: 'wrench', inventory_2: 'layers', table_chart: 'chart', data_usage: 'chart', poll: 'chart',
};

export function mapIcon(material: string | undefined | null): string {
  const k = (material || '').trim();
  return MAP[k] ?? 'sparkles';
}
