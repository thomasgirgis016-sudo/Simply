Add-Type -AssemblyName System.Drawing

$srcPath = (Resolve-Path "public/simply-logo.png").Path
$orig = [System.Drawing.Bitmap]::FromFile($srcPath)
Write-Host "Source: $($orig.Width)x$($orig.Height)"

# Create a vibrant pure orange version of the logo bitmap
$orangeLogo = New-Object System.Drawing.Bitmap($orig.Width, $orig.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

for ($y = 0; $y -lt $orig.Height; $y++) {
    for ($x = 0; $x -lt $orig.Width; $x++) {
        $c = $orig.GetPixel($x, $y)
        if ($c.A -gt 15) {
            # Compute vertical gradient from bright gold-orange (#FFA600) to vivid deep orange (#FF4B00)
            $ratio = $y / [double]$orig.Height
            $r = 255
            $g = [int](166 * (1.0 - $ratio) + 75 * $ratio)
            $b = 0
            # Boost alpha slightly for tiny 16px/32px icons to ensure maximum contrast
            $newA = [Math]::Min(255, [int]($c.A * 1.25))
            $orangeLogo.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($newA, $r, $g, $b))
        } else {
            $orangeLogo.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        }
    }
}

$orig.Dispose()

# Save the vibrant orange logo
$orangeLogo.Save("public/simply-logo.png", [System.Drawing.Imaging.ImageFormat]::Png)
$orangeLogo.Save("public/simply-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Saved vibrant orange simply-logo.png"

function SaveResized($src, [int]$targetSize, $outPath) {
    $dest = New-Object System.Drawing.Bitmap($targetSize, $targetSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::FromArgb(0, 0, 0, 0))
    
    $aspect = $src.Width / [double]$src.Height
    if ($aspect -gt 1.0) {
        $destW = $targetSize
        $destH = [int]($targetSize / $aspect)
    } else {
        $destH = $targetSize
        $destW = [int]($targetSize * $aspect)
    }
    $destX = [int](($targetSize - $destW) / 2)
    $destY = [int](($targetSize - $destH) / 2)
    
    $destRect = New-Object System.Drawing.Rectangle($destX, $destY, $destW, $destH)
    $srcRect = New-Object System.Drawing.Rectangle(0, 0, $src.Width, $src.Height)
    $g.DrawImage($src, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    
    $dest.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $dest.Dispose()
    Write-Host "Created $outPath ($targetSize x $targetSize)"
}

SaveResized $orangeLogo 16 "public/favicon-16x16.png"
SaveResized $orangeLogo 32 "public/favicon-32x32.png"
SaveResized $orangeLogo 48 "public/favicon-48x48.png"
SaveResized $orangeLogo 180 "public/apple-touch-icon.png"
SaveResized $orangeLogo 180 "public/apple-touch-icon-precomposed.png"
SaveResized $orangeLogo 192 "public/pwa-192x192.png"
SaveResized $orangeLogo 512 "public/pwa-512x512.png"

# Windows ICO from 32x32
$b32 = [System.Drawing.Bitmap]::FromFile((Resolve-Path "public/favicon-32x32.png").Path)
$hIcon = $b32.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)
$fs = New-Object System.IO.FileStream("public/favicon.ico", [System.IO.FileMode]::Create)
$icon.Save($fs)
$fs.Close()
$icon.Dispose()
$b32.Dispose()

$orangeLogo.Dispose()
Write-Host "Done! All favicons are now pure vibrant bright orange!"
