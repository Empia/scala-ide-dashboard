name := "scala-ide-dashboard"

version := "0.1.1"

libraryDependencies ++= Seq(
  jdbc,
  anorm,
  cache,
  "org.scalatest" %% "scalatest" % "2.0" % "test"
)     

play.Project.playScalaSettings
