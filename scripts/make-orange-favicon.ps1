Add-Type -AssemblyName System.Drawing

function CreateVibrantOrangeIcon($size, $outPath) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    
    $g.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    # 100% transparent clear background
    $g.Clear([System.Drawing.Color]::FromArgb(0, 0, 0, 0))
    
    $scale = $size / 100.0
    
    # Orange Gradient Brush
    $p1 = New-Object System.Drawing.PointF(0, 0)
    $p2 = New-Object System.Drawing.PointF($size, $size)
    $gradBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($p1, $p2, [System.Drawing.Color]::FromArgb(255, 255, 140, 0), [System.Drawing.Color]::FromArgb(255, 255, 69, 0))
    $solidOrange = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 107, 0))
    $goldBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 179, 0))
    
    # 1. Draw Mortarboard Top (Diamond)
    $capPoints = @(
        New-Object System.Drawing.PointF(50 * $scale, 10 * $scale),
        New-Object System.Drawing.PointF(92 * $scale, 28 * $scale),
        New-Object System.Drawing.PointF(50 * $scale, 46 * $scale),
        New-Object System.Drawing.PointF(8 * $scale, 28 * $scale)
    )
    $g.FillPolygon($solidOrange, $capPoints)
    $capBorderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 255, 180, 50), [Math]::Max(1.5, 3.5 * $scale))
    $g.DrawPolygon($capBorderPen, $capPoints)
    
    # 2. Skull Cap Base (underneath cap)
    $skullPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 230, 81, 0), [Math]::Max(2.0, 6.0 * $scale))
    $skullPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $skullPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $g.DrawArc($skullPen, 24 * $scale, 32 * $scale, 52 * $scale, 28 * $scale, 0, 180)
    
    # 3. Tassel
    $tasselPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 255, 215, 0), [Math]::Max(1.5, 4.0 * $scale))
    $tasselPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $tasselPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $g.DrawLine($tasselPen, 88 * $scale, 30 * $scale, 88 * $scale, 52 * $scale)
    $g.DrawLine($tasselPen, 88 * $scale, 52 * $scale, 92 * $scale, 58 * $scale)
    
    # 4. Bold Vibrant Orange "S" Curve (Interlacing)
    $sPen = New-Object System.Drawing.Pen($gradBrush, [Math]::Max(3.0, 12.0 * $scale))
    $sPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $sPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $sPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    
    $sPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $sPath.AddBezier(
        (New-Object System.Drawing.PointF(72 * $scale, 36 * $scale)),
        (New-Object System.Drawing.PointF(40 * $scale, 36 * $scale)),
        (New-Object System.Drawing.PointF(24 * $scale, 48 * $scale)),
        (New-Object System.Drawing.PointF(24 * $scale, 60 * $scale))
    )
    $sPath.AddBezier(
        (New-Object System.Drawing.PointF(24 * $scale, 60 * $scale)),
        (New-Object System.Drawing.PointF(24 * $scale, 76 * $scale)),
        (New-Object System.Drawing.PointF(76 * $scale, 66 * $scale)),
        (New-Object System.Drawing.PointF(76 * $scale, 82 * $scale))
    )
    $sPath.AddBezier(
        (New-Object System.Drawing.PointF(76 * $scale, 82 * $scale)),
        (New-Object System.Drawing.PointF(76 * $scale, 96 * $scale)),
        (New-Object System.Drawing.PointF(54 * $scale, 98 * $scale)),
        (New-Object System.Drawing.PointF(32 * $scale, 96 * $scale))
    )
    $g.DrawPath($sPen, $sPath)
    
    # Cleanup resources
    $sPen.Dispose()
    $sPath.Dispose()
    $skullPen.Dispose()
    $tasselPen.Dispose()
    $capBorderPen.Dispose()
    $solidOrange.Dispose()
    $goldBrush.Dispose()
    $gradBrush.Dispose()
    $g.Dispose()
    
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Generated $outPath ($size x $size) pure vibrant orange"
}

# Generate PNGs
CreateVibrantOrangeIcon 16 "public/favicon-16x16.png"
CreateVibrantOrangeIcon 32 "public/favicon-32x32.png"
CreateVibrantOrangeIcon 48 "public/favicon-48x48.png"
CreateVibrantOrangeIcon 180 "public/apple-touch-icon.png"
CreateVibrantOrangeIcon 180 "public/apple-touch-icon-precomposed.png"
CreateVibrantOrangeIcon 192 "public/pwa-192x192.png"
CreateVibrantOrangeIcon 512 "public/pwa-512x512.png"

# Generate Windows ICO containing 32x32 icon
$b32 = [System.Drawing.Bitmap]::FromFile((Resolve-Path "public/favicon-32x32.png").Path)
$hIcon = $b32.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)
$fs = New-Object System.IO.FileStream("public/favicon.ico", [System.IO.FileMode]::Create)
$icon.Save($fs)
$fs.Close()
$icon.Dispose()
$b32.Dispose()
Write-Host "Generated public/favicon.ico with vibrant orange icon"
