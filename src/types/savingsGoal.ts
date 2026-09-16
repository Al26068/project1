// 貯金目標（例：沖縄旅行 50,000円）
export interface SavingsGoal {
  id: string
  name: string // 目標名
  targetAmount: number // 目標金額（円）
  color: string // 電池バー・リングに使う色
  backgroundImage?: string // 詳細画面の背景に使う画像（データURL）
}
