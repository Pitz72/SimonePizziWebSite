
Add-Type -AssemblyName System.Drawing

$sourcePath = "C:\Users\Utente\Documents\GitHub\SITI-WEB\SimonePizziWebSite\rlm.png"
$destPath = "C:\Users\Utente\Documents\GitHub\SITI-WEB\SimonePizziWebSite\public\images\rlm.png"

Write-Host "Reading image from $sourcePath"
$image = [System.Drawing.Image]::FromFile($sourcePath)

$originalWidth = $image.Width
$originalHeight = $image.Height
Write-Host "Original dimensions: $originalWidth x $originalHeight"

# Target width 1200px (good for web showcase)
$targetWidth = 1200
$targetHeight = [int]($originalHeight * ($targetWidth / $originalWidth))

if ($originalWidth -gt $targetWidth) {
    Write-Host "Resizing to $targetWidth x $targetHeight"
    $bitmap = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight)
    $graph = [System.Drawing.Graphics]::FromImage($bitmap)
    $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graph.DrawImage($image, 0, 0, $targetWidth, $targetHeight)
    
    $bitmap.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bitmap.Dispose()
    $graph.Dispose()
} else {
    Write-Host "Image is small enough, copying original."
    $image.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
}

$image.Dispose()
Write-Host "Optimized image saved to $destPath"
