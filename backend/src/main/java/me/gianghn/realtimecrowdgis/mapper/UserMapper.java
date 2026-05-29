package me.gianghn.realtimecrowdgis.mapper;

import me.gianghn.realtimecrowdgis.dto.AuthDTO.RegisterRequest;
import me.gianghn.realtimecrowdgis.dto.AuthDTO.RegisterResponse;
import me.gianghn.realtimecrowdgis.dto.UserDTO;
import me.gianghn.realtimecrowdgis.entity.User;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {
    User toEntity(RegisterRequest dto);

    RegisterResponse toRegisterResponse(User user);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateUserFromDTO(UserDTO.UpdateProfileRequest dto, @MappingTarget User existingUser);
}
