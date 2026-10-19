Add-Type -AssemblyName System.Drawing

$srcPath = (Resolve-Path "public/simply-logo.png").Path
$srcBmp = [System.Drawing.Bitmap]::FromFile($srcPath)
Write-Host "Loaded source logo: $($srcBmp.Width)x$($srcBmp.Height), PixelFormat: $($srcBmp.PixelFormat)"

function CreateResizedIcon($src, $targetSize, $outPath) {
    # Create target square bitmap with 32-bit ARGB (transparent)
    $dest = New-Object System.Drawing.Bitmap($targetSize, $targetSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    
    # Enable high quality rendering
    $g.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    # Clear to 100% transparent
    $g.Clear([System.Drawing.Color]::FromArgb(0, 0, 0, 0))
    
    # Calculate aspect ratio to fit inside targetSize while maintaining aspect ratio
    $aspect = $src.Width / $src.Height
    if ($aspect -gt 1.0) {
        $destW = $targetSize
        $destH = [int]($targetSize / $aspect)
    } else {
        $destH = $targetSize
        $destW = [int]($targetSize * $aspect)
    }
    
    # Center within the square
    $destX = [int](($targetSize - $destW) / 2)
    $destY = [int](($targetSize - $destH) / 2)
    
    $destRect = New-Object System.Drawing.Rectangle($destX, $destY, $destW, $destH)
    $srcRect = New-Object System.Drawing.Rectangle(0, 0, $src.Width, $src.Height)
    
    $g.DrawImage($src, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    
    $dest.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $dest.Dispose()
    Write-Host "Created $outPath ($targetSize x $targetSize) with transparent background"
}

# Generate transparent favicons
CreateResizedIcon $srcBmp 16 "public/favicon-16x16.png"
CreateResizedIcon $srcBmp 32 "public/favicon-32x32.png"
CreateResizedIcon $srcBmp 48 "public/favicon-48x48.png"
CreateResizedIcon $srcBmp 180 "public/apple-touch-icon.png"
CreateResizedIcon $srcBmp 180 "public/apple-touch-icon-precomposed.png"
CreateResizedIcon $srcBmp 192 "public/pwa-192x192.png"
CreateResizedIcon $srcBmp 512 "public/pwa-512x512.png"
# Create maskable icon with #090d16 dark background and safe-zone logo
$maskable = New-Object System.Drawing.Bitmap(512, 512, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gMask = [System.Drawing.Graphics]::FromImage($maskable)
$gMask.Clear([System.Drawing.Color]::FromArgb(255, 9, 13, 22))
$gMask.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gMask.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gMask.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$safeSize = 384
$aspect = $srcBmp.Width / $srcBmp.Height
if ($aspect -gt 1.0) {
    $mW = $safeSize
    $mH = [int]($safeSize / $aspect)
} else {
    $mH = $safeSize
    $mW = [int]($safeSize * $aspect)
}
$mX = [int]((512 - $mW) / 2)
$mY = [int]((512 - $mH) / 2)
$gMask.DrawImage($srcBmp, (New-Object System.Drawing.Rectangle($mX, $mY, $mW, $mH)), (New-Object System.Drawing.Rectangle(0, 0, $srcBmp.Width, $srcBmp.Height)), [System.Drawing.GraphicsUnit]::Pixel)
$gMask.Dispose()
$maskable.Save("public/maskable-icon-512x512.png", [System.Drawing.Imaging.ImageFormat]::Png)
$maskable.Dispose()
Write-Host "Created public/maskable-icon-512x512.png with dark theme background"

$b32 = [System.Drawing.Bitmap]::FromFile((Resolve-Path "public/favicon-32x32.png").Path)
$hIcon = $b32.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)
$fs = New-Object System.IO.FileStream("public/favicon.ico", [System.IO.FileMode]::Create)
$icon.Save($fs)
$fs.Close()
$icon.Dispose()
$b32.Dispose()
Write-Host "Created public/favicon.ico"

$srcBmp.Dispose()
Write-Host "All icons regenerated with 100% transparent backgrounds!"


