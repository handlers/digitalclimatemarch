require 'sinatra'
require 'redis'
require 'byebug'
require 'time'
require 'json'
require 'rabl'
require 'active_support/core_ext'
require 'active_support/inflector'
require 'builder'

Rabl.register!
Rabl.configure do |config|
  config.include_json_root = false
  config.include_child_root = false
end

require File.expand_path('constants.rb')

get '/' do
  @markers = process_markers(get_markers(0, 100))
  @markers = Rabl::Renderer.json(@markers, 'markers', :view_path => "views")
  erb :index
end

get '/marker' do
  markers = get_markers(params[:start].to_i, params[:fin].to_i)
  @markers = process_markers(markers)
  puts @markers
  rabl :markers, :format => "json"
end

post '/marker' do
  timestamp = Time.now.to_i
  id = "#{request.ip}_#{timestamp}"
  pin_data = {
    id: id,
    lat: params["lat"].to_f,
    lng: params["lng"].to_f
  }
  pin_data.merge!({motivation: params["motivation"]}) unless params["motivation"] == ""
  pin_data.merge!({name: params["name"]}) unless params["name"] == ""
  REDIS.zadd("markers", timestamp, id)
  REDIS.set(id, pin_data.to_json)
  @marker = process_markers([REDIS.get(id)])
  rabl :marker, :format =>"json"
end

helpers do 
  def get_markers(start=0, fin=-1)
    REDIS.zrevrange("markers", start, fin).map do |id|
      REDIS.get(id)
    end
  end
  def process_markers(markers)
    markers.map do |marker|
      OpenStruct.new(JSON.parse(marker))
    end
  end
end