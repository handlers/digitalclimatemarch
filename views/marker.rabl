object @marker
node(:type) { "Feature"}
node(:geometry) do |marker| {
  "type" => "Point",
  "coordinates" => [marker.lng, marker.lat] }
end
node(:properties) do |marker| {
    "id" => marker.id,
    "title" => marker.name,
    "description" => marker.motivation,
    "marker-color" => "#247000",
    "marker-size" => "large"
  }
end