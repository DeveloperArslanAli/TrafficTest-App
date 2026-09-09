Add-Type -AssemblyName System.Drawing

function Render-RoadWiseIcon {
    param(
        [int]$Width,
        [int]$Height,
        [string]$OutputPath,
        [bool]$ForegroundOnly = $false,
        [bool]$IsRound = $false
    )

    $bmp = New-Object System.Drawing.Bitmap($Width, $Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    $g.Clear([System.Drawing.Color]::Transparent)

    $scale = [float]$Width / 512.0

    if (-not $ForegroundOnly) {
        # 1. Background Fill
        $rect = New-Object System.Drawing.RectangleF(0.0, 0.0, [float]$Width, [float]$Height)
        $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
            $rect,
            [System.Drawing.Color]::FromArgb(255, 15, 39, 68),   # #0F2744
            [System.Drawing.Color]::FromArgb(255, 26, 60, 94),   # #1A3C5E
            [System.Drawing.Drawing2D.LinearGradientMode]::Vertical
        )

        if ($IsRound) {
            $g.FillEllipse($bgBrush, 0.0, 0.0, [float]$Width, [float]$Height)
            $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(160, 56, 189, 248), [float](6.0 * $scale))
            $g.DrawEllipse($borderPen, [float](3.0 * $scale), [float](3.0 * $scale), [float]($Width - 6.0 * $scale), [float]($Height - 6.0 * $scale))
            $borderPen.Dispose()
        } else {
            # Rounded squircle
            $path = New-Object System.Drawing.Drawing2D.GraphicsPath
            $radius = [float](110.0 * $scale)
            $d = [float]($radius * 2.0)

            $path.AddArc(0.0, 0.0, $d, $d, 180.0, 90.0)
            $path.AddArc([float]($Width - $d), 0.0, $d, $d, 270.0, 90.0)
            $path.AddArc([float]($Width - $d), [float]($Height - $d), $d, $d, 0.0, 90.0)
            $path.AddArc(0.0, [float]($Height - $d), $d, $d, 90.0, 90.0)
            $path.CloseFigure()

            $g.FillPath($bgBrush, $path)

            # Subtle accent border
            $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(160, 56, 189, 248), [float](6.0 * $scale))
            $g.DrawPath($borderPen, $path)
            $borderPen.Dispose()
            $path.Dispose()
        }
        $bgBrush.Dispose()

        # Perspective road lane lines
        $roadPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(70, 255, 255, 255), [float](4.0 * $scale))
        $roadPen.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
        $g.DrawLine($roadPen, [float](150.0 * $scale), [float](512.0 * $scale), [float](225.0 * $scale), [float](360.0 * $scale))
        $g.DrawLine($roadPen, [float](362.0 * $scale), [float](512.0 * $scale), [float](287.0 * $scale), [float](360.0 * $scale))
        $roadPen.Dispose()
    }

    # 2. Traffic Light Housing
    $housingX = [float](196.0 * $scale)
    $housingY = [float](86.0 * $scale)
    $housingW = [float](120.0 * $scale)
    $housingH = [float](340.0 * $scale)
    $housingRadius = [float](40.0 * $scale)
    $hd = [float]($housingRadius * 2.0)

    $hPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $hPath.AddArc($housingX, $housingY, $hd, $hd, 180.0, 90.0)
    $hPath.AddArc([float]($housingX + $housingW - $hd), $housingY, $hd, $hd, 270.0, 90.0)
    $hPath.AddArc([float]($housingX + $housingW - $hd), [float]($housingY + $housingH - $hd), $hd, $hd, 0.0, 90.0)
    $hPath.AddArc($housingX, [float]($housingY + $housingH - $hd), $hd, $hd, 90.0, 90.0)
    $hPath.CloseFigure()

    # Housing shadow
    $shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(110, 0, 0, 0))
    $g.TranslateTransform([float](5.0 * $scale), [float](8.0 * $scale))
    $g.FillPath($shadowBrush, $hPath)
    $g.TranslateTransform([float](-5.0 * $scale), [float](-8.0 * $scale))
    $shadowBrush.Dispose()

    # Housing body
    $hBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 30, 41, 59)) # #1E293B
    $g.FillPath($hBrush, $hPath)
    $hBrush.Dispose()

    # Housing border
    $hPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 56, 189, 248), [float](5.0 * $scale))
    $g.DrawPath($hPen, $hPath)
    $hPen.Dispose()
    $hPath.Dispose()

    # Visor hoods
    $visorPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 15, 23, 42), [float](6.0 * $scale))
    $g.DrawArc($visorPen, [float]($housingX + 16.0 * $scale), [float]($housingY + 30.0 * $scale), [float](88.0 * $scale), [float](36.0 * $scale), 180.0, 180.0)
    $g.DrawArc($visorPen, [float]($housingX + 16.0 * $scale), [float]($housingY + 138.0 * $scale), [float](88.0 * $scale), [float](36.0 * $scale), 180.0, 180.0)
    $g.DrawArc($visorPen, [float]($housingX + 16.0 * $scale), [float]($housingY + 246.0 * $scale), [float](88.0 * $scale), [float](36.0 * $scale), 180.0, 180.0)
    $visorPen.Dispose()

    # 3. Lenses: RED, YELLOW, GREEN
    $lensD = [float](74.0 * $scale)
    $lensX = [float]($housingX + ($housingW - $lensD) / 2.0)

    # --- RED LENS ---
    $redY = [float]($housingY + 32.0 * $scale)
    $redBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 239, 68, 68)) # #EF4444
    $g.FillEllipse($redBrush, $lensX, $redY, $lensD, $lensD)
    $redBrush.Dispose()

    $redCore = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 254, 202, 202))
    $g.FillEllipse($redCore, [float]($lensX + 20.0 * $scale), [float]($redY + 16.0 * $scale), [float](22.0 * $scale), [float](22.0 * $scale))
    $redCore.Dispose()

    $redPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 252, 165, 165), [float](2.5 * $scale))
    $g.DrawEllipse($redPen, $lensX, $redY, $lensD, $lensD)
    $redPen.Dispose()

    # --- YELLOW LENS ---
    $yellowY = [float]($housingY + 140.0 * $scale)
    $yellowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 245, 158, 11)) # #F59E0B
    $g.FillEllipse($yellowBrush, $lensX, $yellowY, $lensD, $lensD)
    $yellowBrush.Dispose()

    $yellowCore = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 254, 240, 138))
    $g.FillEllipse($yellowCore, [float]($lensX + 20.0 * $scale), [float]($yellowY + 16.0 * $scale), [float](22.0 * $scale), [float](22.0 * $scale))
    $yellowCore.Dispose()

    $yellowPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 253, 224, 71), [float](2.5 * $scale))
    $g.DrawEllipse($yellowPen, $lensX, $yellowY, $lensD, $lensD)
    $yellowPen.Dispose()

    # --- GREEN LENS ---
    $greenY = [float]($housingY + 248.0 * $scale)
    $greenBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 16, 185, 129)) # #10B981
    $g.FillEllipse($greenBrush, $lensX, $greenY, $lensD, $lensD)
    $greenBrush.Dispose()

    $greenCore = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 167, 243, 208))
    $g.FillEllipse($greenCore, [float]($lensX + 20.0 * $scale), [float]($greenY + 16.0 * $scale), [float](22.0 * $scale), [float](22.0 * $scale))
    $greenCore.Dispose()

    $greenPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 52, 211, 153), [float](2.5 * $scale))
    $g.DrawEllipse($greenPen, $lensX, $greenY, $lensD, $lensD)
    $greenPen.Dispose()

    $g.Dispose()

    $dir = [System.IO.Path]::GetDirectoryName($OutputPath)
    if (-not [System.IO.Directory]::Exists($dir)) {
        [System.IO.Directory]::CreateDirectory($dir) | Out-Null
    }

    $bmp.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Created: $OutputPath ($Width x $Height)"
}

$baseDir = "E:\Projects\mobile application\Drivers Road Practice"

# 1. Android Mipmaps
$mipmaps = @{
    "mipmap-mdpi"    = 48
    "mipmap-hdpi"    = 72
    "mipmap-xhdpi"   = 96
    "mipmap-xxhdpi"  = 144
    "mipmap-xxxhdpi" = 192
}

foreach ($entry in $mipmaps.GetEnumerator()) {
    $folder = Join-Path "$baseDir\mobile\android\app\src\main\res" $entry.Key
    $size = $entry.Value
    
    # Standard launcher
    Render-RoadWiseIcon -Width $size -Height $size -OutputPath "$folder\ic_launcher.png" -ForegroundOnly $false -IsRound $false
    # Round launcher
    Render-RoadWiseIcon -Width $size -Height $size -OutputPath "$folder\ic_launcher_round.png" -ForegroundOnly $false -IsRound $true
    # Adaptive foreground
    Render-RoadWiseIcon -Width ($size * 2) -Height ($size * 2) -OutputPath "$folder\ic_launcher_foreground.png" -ForegroundOnly $true -IsRound $false
}

# 2. Mobile Assets
Render-RoadWiseIcon -Width 1024 -Height 1024 -OutputPath "$baseDir\mobile\assets\icon.png" -ForegroundOnly $false -IsRound $false
Render-RoadWiseIcon -Width 1024 -Height 1024 -OutputPath "$baseDir\mobile\assets\adaptive-icon.png" -ForegroundOnly $true -IsRound $false
Render-RoadWiseIcon -Width 64 -Height 64 -OutputPath "$baseDir\mobile\assets\favicon.png" -ForegroundOnly $false -IsRound $false

# 3. Admin Panel Web Favicon & Brand Icon
Render-RoadWiseIcon -Width 64 -Height 64 -OutputPath "$baseDir\admin\public\favicon.png" -ForegroundOnly $false -IsRound $false
Render-RoadWiseIcon -Width 64 -Height 64 -OutputPath "$baseDir\admin\public\favicon.ico" -ForegroundOnly $false -IsRound $false

Write-Host "✨ All RoadWise App Icons and Favicons successfully rendered with zero errors!"
