package org.scalaide.dashboard.users

import akka.actor.ActorRef
import play.api.libs.iteratee.Concurrent
import play.api.libs.json.JsValue
import akka.actor.Props
import akka.actor.Actor
import akka.event.LoggingReceive
import play.api.libs.json.JsObject
import play.api.libs.json.JsString
import org.scalaide.dashboard.projects.ProjectsActor
import play.api.libs.json.Json
import play.api.libs.json.JsObject
import akka.actor.PoisonPill
import model.Project

class UsersActor(projects: ActorRef) extends Actor {

  import UsersActor._

  override def receive = LoggingReceive {
    case NewUser(c) =>
      val newUser = context.actorOf(UserActor.props(c, projects))
      sender ! User(newUser)
  }
}

object UsersActor {

  case class NewUser(c: Concurrent.Channel[JsValue])
  case class User(a: ActorRef)

  def props(projects: ActorRef) = Props(classOf[UsersActor], projects)

}

class UserActor(channel: Concurrent.Channel[JsValue], projects: ActorRef) extends Actor {

  import UserActor._

  override def receive = LoggingReceive {
    case FromClient(json: JsValue) =>
      projects ! ProjectsActor.SubscribeAndGetAll
    case ProjectsActor.Projects(ps) =>
      ps.foreach(push)
    case ProjectsActor.ModifiedProject(p) =>
      push(p)
    case ClientConnectionLost =>
      projects ! ProjectsActor.Unsubscribe
      self ! PoisonPill
  }

  private def push(project: Project) {
    import model.WebAppJsonWriters._
    channel.push(Json.obj("project" -> Json.toJson(project)))
  }

  override def postStop() {
    channel.eofAndEnd()
  }

}

object UserActor {
  case class FromClient(j: JsValue)
  case object ClientConnectionLost

  def props(channel: Concurrent.Channel[JsValue], projects: ActorRef) = Props(classOf[UserActor], channel, projects)
}