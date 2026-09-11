# AERIS Command Line

AERIS menyediakan command line global untuk berpindah workspace dengan cepat.

## Membuka Command Line

Tekan:

```text
Ctrl + Shift + K
```

Command line akan muncul sebagai terminal overlay. Ketik command lalu tekan `Enter`.
Tekan `Esc` belum didukung sebagai shortcut khusus; gunakan command `exit` atau tombol `X` untuk menutup panel.

## Navigation Commands

| Command         | Destination       |
| --------------- | ----------------- |
| `to dashboard`  | Dashboard         |
| `to project`    | Projects          |
| `to projects`   | Projects          |
| `to task`       | Tasks             |
| `to tasks`      | Tasks             |
| `to note`       | Notes             |
| `to notes`      | Notes             |
| `to vocab`      | IELTS Vocabulary  |
| `to vocabulary` | IELTS Vocabulary  |
| `to event`      | Events / Calendar |
| `to events`     | Events / Calendar |
| `to calendar`   | Events / Calendar |
| `to document`   | Documents         |
| `to documents`  | Documents         |

## Utility Commands

| Command | Function                                |
| ------- | --------------------------------------- |
| `help`  | Menampilkan semua command yang tersedia |
| `clear` | Membersihkan output terminal            |
| `exit`  | Menutup command line                    |
| `quit`  | Alias untuk `exit`                      |

## Examples

```text
$ to project
Opening Projects...

$ to vocab
Opening IELTS Vocabulary...

$ help
```

## Scope

Command line saat ini berfokus pada navigasi workspace. Command yang tidak dikenal akan menampilkan pesan error dan saran untuk menjalankan `help`.
