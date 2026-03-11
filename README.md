<div align="center">

# 🧰 VN Toolkit — Bộ công cụ tiện ích cho dân văn phòng

**22+ công cụ miễn phí** — Tính lương, chia bill, tra cứu MST, nén ảnh, tạo QR và nhiều hơn nữa.  
Chạy ngay trên trình duyệt, không cần đăng ký, không quảng cáo.

[![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## ✨ Tại sao nên dùng VN Toolkit?

| | |
|---|---|
| 🚀 **Nhanh & nhẹ** | Chạy ngay trên trình duyệt, không cần cài đặt phần mềm |
| 🔒 **Bảo mật** | Dữ liệu xử lý 100% trên máy bạn, không gửi lên server |
| 🇻🇳 **Việt hóa** | Giao diện tiếng Việt & English, các công cụ phù hợp cho người Việt |
| 🌙 **Dark mode** | Chế độ sáng/tối dễ chịu cho mắt |
| 📱 **Responsive** | Dùng tốt trên điện thoại, tablet & PC |
| 💯 **Miễn phí** | Không quảng cáo, không thu phí, mã nguồn mở |

---

## 🛠️ Danh sách 22+ công cụ

### 📝 Văn bản
| Công cụ | Mô tả |
|---|---|
| Đếm từ & ký tự | Đếm từ, ký tự, câu, đoạn văn và thời gian đọc |
| Chuyển HOA / thường | Chuyển đổi CHỮ HOA, chữ thường, Title Case, Sentence case |
| Tạo văn bản (AI) | Tạo văn bản mẫu bằng AI hoặc Lorem Ipsum |

### 🖼️ Hình ảnh
| Công cụ | Mô tả |
|---|---|
| Nén ảnh | Giảm dung lượng ảnh để gửi email, Zalo, upload nhanh hơn |
| Tạo mã QR | Tạo mã QR từ link, văn bản, WiFi — tải PNG/SVG |
| Quét mã QR 🆕 | Upload ảnh QR để giải mã ra link, văn bản |

### 💰 Tài chính
| Công cụ | Mô tả |
|---|---|
| Tính lương NET/GROSS | Tính lương thực nhận, trừ BHXH, BHYT, thuế TNCN theo luật VN |
| Tính lãi vay | Tính tiền trả hàng tháng, tổng lãi cho vay mua nhà, xe |
| Đổi tiền tệ | Chuyển đổi tỷ giá VND, USD, EUR, JPY và nhiều ngoại tệ khác |
| Chia tiền nhóm | Chia bill đi ăn, tính tip, ai trả thêm bao nhiêu |

### 🔍 Tra cứu VN
| Công cụ | Mô tả |
|---|---|
| Tra cứu mã số thuế | Tra thông tin doanh nghiệp từ MST Việt Nam |
| Tra cứu ngân hàng | Danh sách 50+ ngân hàng VN — mã SWIFT, BIN thẻ |
| Lịch âm dương 🆕 | Chuyển đổi ngày dương ↔ âm lịch, xem ngày tốt xấu, can chi |

### 🔢 Tính toán
| Công cụ | Mô tả |
|---|---|
| Tính BMI | Tính chỉ số BMI, phân loại theo WHO châu Á |
| Tính tuổi | Tính tuổi chính xác, số ngày giữa 2 mốc, sinh nhật tiếp theo |
| Đổi đơn vị | cm↔inch, kg↔lbs, °C↔°F, km↔miles và nhiều đơn vị khác |

### ⚡ Năng suất
| Công cụ | Mô tả |
|---|---|
| Pomodoro Timer | Đồng hồ tập trung theo phương pháp Pomodoro 25/5 phút |
| Ghi chú nhanh | Sticky note nhiều màu, lưu ngay trên trình duyệt |
| Vòng quay may mắn | Bốc thăm, quay số ngẫu nhiên — team building |
| Tạo mật khẩu | Tạo mật khẩu mạnh, ngẫu nhiên, an toàn |
| Mail ảo (Temp Mail) 🆕 | Tạo email tạm thời, nhận thư xác minh |
| Tạo chữ ký email 🆕 | Chữ ký email chuyên nghiệp cho Gmail, Outlook |

---

## 🚀 Cài đặt & Chạy

```bash
# Clone repo
git clone https://github.com/tranchanhung/devtoolkit.git
cd devtoolkit

# Cài dependencies
npm install

# Chạy dev server
npm run dev
```

Mở trình duyệt tại **http://localhost:5173** — xong!

---

## 🏗️ Tech Stack

| Công nghệ | Vai trò |
|---|---|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Vite 5** | Build tool siêu nhanh |
| **Tailwind CSS** | Utility-first CSS |
| **Framer Motion** | Animation mượt mà |
| **Zustand** | State management nhẹ |
| **i18next** | Đa ngôn ngữ (VI / EN) |
| **React Router 6** | SPA routing |

---

## 📁 Cấu trúc dự án

```
src/
├── components/     # UI components dùng chung (GlassCard, CopyButton, ...)
├── hooks/          # Custom hooks (useClipboard, useFileUpload)
├── i18n/           # File ngôn ngữ (vi.json, en.json)
├── layouts/        # Layout chính (AppShell, Navbar, Sidebar)
├── pages/          # Pages (Home, ToolPage, NotFound)
├── tools/          # 22+ công cụ — mỗi tool 1 folder riêng
├── registry.ts     # Đăng ký & quản lý danh sách tools
├── store.ts        # Zustand store (theme, favorites, recent)
└── i18n.ts         # Cấu hình đa ngôn ngữ
```

---

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Bạn có thể:

1. **Fork** repo này
2. Tạo branch mới: `git checkout -b feature/ten-tool-moi`
3. Commit thay đổi: `git commit -m "Thêm tool mới: ..."`
4. Push & tạo **Pull Request**

Hoặc đơn giản hơn — mở [Issue](../../issues) để gợi ý công cụ mới!

---

## 📝 License

[MIT](LICENSE) — Tự do sử dụng, chỉnh sửa và chia sẻ.

---

<div align="center">

Made with ♥ by **Trần Chấn Hưng**

⭐ **Nếu thấy hữu ích, hãy cho mình 1 star nhé!** ⭐

</div>
