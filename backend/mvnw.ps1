param (
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$MavenArgs
)

# Sanitize JAVA_HOME: strip quotes and trailing \bin
if ($env:JAVA_HOME) {
    $clean = $env:JAVA_HOME.Trim('"').Trim("'")
    if ($clean.ToLower().EndsWith('\bin') -or $clean.ToLower().EndsWith('/bin')) {
        $clean = $clean.Substring(0, $clean.Length - 4)
    }
    $env:JAVA_HOME = $clean
} else {
    $env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
}

$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

# Find Maven in .m2 cache
$foundMvn = Get-ChildItem -Path "$env:USERPROFILE\.m2\wrapper\dists\*\*\bin\mvn.cmd" -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName

if (-not $foundMvn) {
    $codeMvn = "$env:APPDATA\Code\User\globalStorage\pleiades.java-extension-pack-jdk\maven\latest\bin\mvn.cmd"
    if (Test-Path $codeMvn) {
        $foundMvn = $codeMvn
    }
}

if (-not $foundMvn) {
    $mvnCmd = Get-Command mvn -ErrorAction SilentlyContinue
    if ($mvnCmd) {
        $foundMvn = $mvnCmd.Source
    }
}

if ($foundMvn) {
    & $foundMvn @MavenArgs
    exit $LASTEXITCODE
} else {
    Write-Error "Maven (mvn.cmd) not found on this system. Please check your Maven installation."
    exit 1
}
