Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$outputDir = Join-Path $root 'assets\images'
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

function New-BrandBitmap([bool]$transparent) {
  $size = 1024
  $bitmap = [System.Drawing.Bitmap]::new($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.Clear([System.Drawing.Color]::Transparent)

  if (-not $transparent) {
    $gradient = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
      [System.Drawing.Rectangle]::new(0, 0, $size, $size),
      [System.Drawing.Color]::FromArgb(48, 161, 255),
      [System.Drawing.Color]::FromArgb(9, 73, 157),
      135
    )
    $graphics.FillRectangle($gradient, 0, 0, $size, $size)
    $gradient.Dispose()
  }

  $white = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(248, 252, 255))
  $cutout = if ($transparent) { [System.Drawing.SolidBrush]::new([System.Drawing.Color]::Transparent) } else { [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(20, 91, 181)) }
  $graphics.FillEllipse($white, 290, 250, 444, 444)
  $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
  $graphics.FillEllipse($cutout, 405, 205, 444, 444)
  $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver

  $dot = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(225, 241, 255))
  $graphics.FillEllipse($dot, 720, 220, 34, 34)
  $graphics.FillEllipse($dot, 770, 280, 16, 16)

  $dot.Dispose()
  $cutout.Dispose()
  $white.Dispose()
  $graphics.Dispose()
  return $bitmap
}

$icon = New-BrandBitmap $false
$icon.Save((Join-Path $outputDir 'deep-focus-icon.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$icon.Dispose()

$splash = New-BrandBitmap $true
$splash.Save((Join-Path $outputDir 'deep-focus-splash.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$splash.Dispose()

Write-Output 'Generated deep-focus-icon.png and deep-focus-splash.png.'
