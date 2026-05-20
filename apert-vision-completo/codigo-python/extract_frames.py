import cv2
import os
from pathlib import Path


def extract_frames(video_path: str, output_folder: str, every_n_seconds: float = 2.0):
    """
    Extrae 1 frame cada N segundos de un video.

    Args:
        video_path:      ruta al video (.mp4, .mov, etc.)
        output_folder:   carpeta donde se guardan las imágenes
        every_n_seconds: cada cuántos segundos sacar un frame (default: 2)
    """
    Path(output_folder).mkdir(parents=True, exist_ok=True)

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"[ERROR] No se pudo abrir: {video_path}")
        return

    fps         = cap.get(cv2.CAP_PROP_FPS) or 25
    total       = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    interval    = int(fps * every_n_seconds)   # cada cuántos frames sacar uno
    duration    = total / fps

    video_name  = Path(video_path).stem        # nombre del video sin extensión
    saved       = 0
    frame_count = 0

    print(f"Video:      {video_path}")
    print(f"Duración:   {duration:.1f}s  ({int(duration//60)}:{int(duration%60):02d})")
    print(f"FPS:        {fps:.1f}")
    print(f"Intervalo:  1 frame cada {every_n_seconds}s (cada {interval} frames)")
    print(f"Estimado:   ~{int(duration / every_n_seconds)} imágenes")
    print(f"Destino:    {output_folder}")
    print("─" * 50)

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if frame_count % interval == 0:
            # nombre: nombre_video_0000.jpg
            filename = os.path.join(output_folder, f"{video_name}_{saved:04d}.jpg")
            cv2.imwrite(filename, frame, [cv2.IMWRITE_JPEG_QUALITY, 92])
            saved += 1

            # progreso cada 10 imágenes guardadas
            if saved % 10 == 0:
                pct = frame_count / total * 100
                print(f"  {saved} imágenes guardadas ({pct:.0f}%)...")

        frame_count += 1

    cap.release()
    print(f"\n✓ Listo. {saved} imágenes guardadas en '{output_folder}'")
    return saved


def extract_multiple_videos(videos_folder: str, output_folder: str, every_n_seconds: float = 2.0):
    """
    Procesa TODOS los videos de una carpeta de una sola vez.
    Útil si tenés varios partidos grabados.
    """
    extensions = (".mp4", ".mov", ".avi", ".mkv")
    videos = [f for f in Path(videos_folder).iterdir() if f.suffix.lower() in extensions]

    if not videos:
        print(f"[ERROR] No se encontraron videos en: {videos_folder}")
        return

    print(f"Se encontraron {len(videos)} video(s)\n")
    total_saved = 0

    for i, video in enumerate(videos, 1):
        print(f"[{i}/{len(videos)}] Procesando: {video.name}")
        saved = extract_frames(str(video), output_folder, every_n_seconds)
        total_saved += saved or 0
        print()

    print("=" * 50)
    print(f"Total de imágenes extraídas: {total_saved}")
    print(f"Carpeta: {output_folder}")


# ─────────────────────────────────────────────
#  CONFIGURACIÓN — editá estas líneas
# ─────────────────────────────────────────────

if __name__ == "__main__":

    # OPCIÓN A: un solo video
    extract_frames(
        video_path     = "partido.mp4",   # <-- cambiá por la ruta a tu video
        output_folder  = "dataset/frames",
        every_n_seconds= 2.0
    )

    # OPCIÓN B: todos los videos de una carpeta
    # (descomentá las líneas de abajo y comentá la opción A)
    #
    # extract_multiple_videos(
    #     videos_folder  = "videos",        # <-- carpeta con tus videos
    #     output_folder  = "dataset/frames",
    #     every_n_seconds= 2.0
    # )
